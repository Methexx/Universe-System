import { prisma } from '../../config/prisma';
import { CreateTermInput, UpdateTermInput, CreateResultSetInput, SaveResultSetInput } from './results.schema';

export class ResultsService {

  // ── Terms ──────────────────────────────────────────────────────────────────

  static async getTerms() {
    return prisma.term.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  static async createTerm(input: CreateTermInput, teacherId: string) {
    return prisma.term.create({
      data: { label: input.label, created_by: teacherId },
    });
  }

  static async renameTerm(termId: string, input: UpdateTermInput, teacherId: string) {
    await ResultsService.assertTermExists(termId);
    return prisma.term.update({
      where: { id: termId },
      data: { label: input.label },
    });
  }

  static async deleteTerm(termId: string, teacherId: string) {
    await ResultsService.assertTermExists(termId);
    const linked = await prisma.resultSet.count({ where: { term_id: termId } });
    if (linked > 0) throw new Error('Cannot delete a term that has result sets. Remove those first.');
    return prisma.term.delete({ where: { id: termId } });
  }

  // ── Result sets ────────────────────────────────────────────────────────────

  static async getClassResultSets(classId: string, teacherId: string) {
    await ResultsService.assertTeacherOwnsClass(classId, teacherId);
    return prisma.resultSet.findMany({
      where: { class_id: classId },
      include: {
        term: true,
        modules: { orderBy: { order_index: 'asc' } },
        grades: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getOrCreateResultSet(classId: string, termId: string, teacherId: string) {
    await ResultsService.assertTeacherOwnsClass(classId, teacherId);
    await ResultsService.assertTermExists(termId);

    const existing = await prisma.resultSet.findUnique({
      where: { class_id_term_id: { class_id: classId, term_id: termId } },
      include: {
        term: true,
        modules: { orderBy: { order_index: 'asc' } },
        grades: true,
      },
    });
    if (existing) return existing;

    return prisma.resultSet.create({
      data: { class_id: classId, teacher_id: teacherId, term_id: termId, status: 'draft' },
      include: {
        term: true,
        modules: { orderBy: { order_index: 'asc' } },
        grades: true,
      },
    });
  }

  static async saveResultSet(resultSetId: string, teacherId: string, input: SaveResultSetInput) {
    await ResultsService.assertTeacherOwnsResultSet(resultSetId, teacherId);

    await prisma.$transaction(async (tx) => {
      // Sync modules
      await tx.resultModule.deleteMany({ where: { result_set_id: resultSetId } });

      const createdModules = await Promise.all(
        input.modules.map((mod) =>
          tx.resultModule.create({
            data: { result_set_id: resultSetId, name: mod.name, order_index: mod.order_index },
          })
        )
      );

      const moduleByName = new Map(createdModules.map((m) => [m.name, m.id]));

      // Sync grades
      await tx.studentGrade.deleteMany({ where: { result_set_id: resultSetId } });

      const gradeData = input.grades
        .filter((g) => moduleByName.has(g.module_name))
        .map((g) => ({
          result_set_id: resultSetId,
          module_id: moduleByName.get(g.module_name)!,
          student_id: g.student_id,
          score: g.score,
        }));

      if (gradeData.length > 0) {
        await tx.studentGrade.createMany({ data: gradeData });
      }
    });

    return prisma.resultSet.findUniqueOrThrow({
      where: { id: resultSetId },
      include: {
        term: true,
        modules: { orderBy: { order_index: 'asc' } },
        grades: true,
      },
    });
  }

  static async publishResultSet(resultSetId: string, teacherId: string) {
    await ResultsService.assertTeacherOwnsResultSet(resultSetId, teacherId);
    return prisma.resultSet.update({
      where: { id: resultSetId },
      data: { status: 'published', published_at: new Date() },
      include: { term: true, modules: { orderBy: { order_index: 'asc' } }, grades: true },
    });
  }

  static async unpublishResultSet(resultSetId: string, teacherId: string) {
    await ResultsService.assertTeacherOwnsResultSet(resultSetId, teacherId);
    return prisma.resultSet.update({
      where: { id: resultSetId },
      data: { status: 'draft', published_at: null },
      include: { term: true, modules: { orderBy: { order_index: 'asc' } }, grades: true },
    });
  }

  // ── Private guards ──────────────────────────────────────────────────────────

  private static async assertTermExists(termId: string) {
    const term = await prisma.term.findUnique({ where: { id: termId } });
    if (!term) throw new Error('Term not found');
    return term;
  }

  private static async assertTeacherOwnsClass(classId: string, teacherId: string) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error('Class not found');
    if (cls.teacher_id !== teacherId) throw new Error('You are not assigned to this class');
    return cls;
  }

  private static async assertTeacherOwnsResultSet(resultSetId: string, teacherId: string) {
    const rs = await prisma.resultSet.findUnique({ where: { id: resultSetId } });
    if (!rs) throw new Error('Result set not found');
    if (rs.teacher_id !== teacherId) throw new Error('Access denied');
    return rs;
  }
}
