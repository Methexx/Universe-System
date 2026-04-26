import { prisma } from '../../config/prisma';
import { supabaseAdmin } from '../../config/supabase';
import { CreateGradeInput, CreateClassInput, CreateStudentInput } from './school.schema';

export class SchoolService {
  // --- GRADES ---
  static async createGrade(input: CreateGradeInput) {
    const existing = await prisma.schoolGrade.findUnique({ where: { name: input.name } });
    if (existing) throw new Error('Grade name already exists');
    return prisma.schoolGrade.create({ data: input });
  }

  static async getGrades() {
    return prisma.schoolGrade.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // --- CLASSES ---
  static async createClass(input: CreateClassInput) {
    const existing = await prisma.class.findFirst({
      where: {
        school_grade_id: input.school_grade_id,
        name: input.name
      }
    });
    if (existing) throw new Error('Class with this Name already exists in this Grade');

    if (input.teacher_id) {
      const teacher = await prisma.user.findUnique({ where: { id: input.teacher_id } });
      if (!teacher || teacher.role !== 'teacher') {
        throw new Error('Assigned user must be a valid teacher');
      }
    }

    return prisma.class.create({
      data: input,
      include: {
        school_grade: true,
        teacher: { select: { id: true, full_name: true, email: true } }
      }
    });
  }

  static async getClasses() {
    return prisma.class.findMany({
      include: {
        school_grade: true,
        teacher: { select: { id: true, full_name: true, email: true } },
        _count: { select: { students: true } }
      },
      orderBy: [
        { school_grade: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  }

  static async getMyClasses(teacherId: string) {
    return prisma.class.findMany({
      where: { teacher_id: teacherId },
      include: {
        school_grade: true,
        _count: { select: { students: true } }
      }
    });
  }

  static async getClassStudents(classId: string) {
    return prisma.student.findMany({
      where: { class_id: classId },
      orderBy: { full_name: 'asc' }
    });
  }

  static async getGradesWithClasses() {
    return prisma.schoolGrade.findMany({
      include: {
        classes: {
          include: {
            teacher: { select: { id: true, full_name: true, email: true, user_id_no: true } }
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // --- STUDENTS ---
  static async createStudent(input: CreateStudentInput) {
    let student_id_no = input.student_id_no;
    if (!student_id_no) {
      const count = await prisma.student.count();
      student_id_no = `S-${String(count + 1).padStart(6, '0')}`;
    }

    const existingId = await prisma.student.findUnique({ where: { student_id_no } });
    if (existingId) throw new Error('Student ID Number already exists');

    const { student_id_no: _omit, ...rest } = input;
    return prisma.student.create({
      data: {
        ...rest,
        student_id_no,
        date_of_birth: new Date(input.date_of_birth),
      }
    });
  }

  static async getStudents() {
    const students = await prisma.student.findMany({
      include: {
        class: {
          include: { school_grade: true }
        }
      },
      orderBy: { full_name: 'asc' }
    });

    const emails = students.map(s => s.parent_email).filter(Boolean) as string[];
    const parents = emails.length > 0
      ? await prisma.user.findMany({
          where: { email: { in: emails }, role: 'parent' },
          select: { email: true, user_id_no: true }
        })
      : [];
    const parentMap = new Map(parents.map(p => [p.email, p]));

    return students.map(s => ({
      ...s,
      parent_id_no: s.parent_email ? (parentMap.get(s.parent_email)?.user_id_no ?? null) : null,
    }));
  }

  static async getNextStudentId(): Promise<string> {
    const count = await prisma.student.count();
    return `S-${String(count + 1).padStart(6, '0')}`;
  }

  static async uploadStudentPhoto(file: Buffer, mimetype: string, filename: string): Promise<string> {
    const ext = mimetype.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const path = `students/${filename}-${Date.now()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from('student-photos')
      .upload(path, file, { contentType: mimetype, upsert: true });
    if (error) throw new Error(error.message);
    return supabaseAdmin.storage.from('student-photos').getPublicUrl(path).data.publicUrl;
  }
}