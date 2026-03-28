import { prisma } from '../../config/prisma';
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

  // --- STUDENTS ---
  static async createStudent(input: CreateStudentInput) {
    const existingId = await prisma.student.findUnique({ where: { student_id_no: input.student_id_no } });
    if (existingId) throw new Error('Student ID Number already exists');

    return prisma.student.create({
      data: {
        ...input,
        date_of_birth: new Date(input.date_of_birth),
      }
    });
  }

  static async getStudents() {
    return prisma.student.findMany({
      include: {
        class: {
          include: { school_grade: true }
        }
      },
      orderBy: { full_name: 'asc' }
    });
  }
}