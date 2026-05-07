import { prisma } from '../../config/prisma';
import { supabaseAdmin } from '../../config/supabase';
import { CreateGradeInput, CreateClassInput, CreateStudentInput, UpdateStudentInput } from './school.schema';

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

  static async deleteGrade(id: string) {
    const grade = await prisma.schoolGrade.findUnique({ where: { id } });
    if (!grade) throw new Error('Grade not found');
    return prisma.schoolGrade.delete({ where: { id } });
  }

  static async deleteClass(id: string) {
    const cls = await prisma.class.findUnique({ where: { id } });
    if (!cls) throw new Error('Class not found');
    return prisma.class.delete({ where: { id } });
  }

  static async updateClass(id: string, input: { teacher_id?: string | null; name?: string; subject?: string | null }) {
    const cls = await prisma.class.findUnique({ where: { id } });
    if (!cls) throw new Error('Class not found');

    if (input.teacher_id) {
      const teacher = await prisma.user.findUnique({ where: { id: input.teacher_id } });
      if (!teacher || teacher.role !== 'teacher') throw new Error('Assigned user must be a valid teacher');
    }

    return prisma.class.update({
      where: { id },
      data: input,
      include: {
        school_grade: true,
        teacher: { select: { id: true, full_name: true, email: true } }
      }
    });
  }

  // --- STUDENTS ---
  static async createStudent(input: CreateStudentInput) {
    let student_id_no = input.student_id_no;
    if (!student_id_no) {
      student_id_no = await this.getNextStudentId();
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
          include: {
            school_grade: true,
            teacher: { select: { id: true, full_name: true } }
          }
        }
      },
      orderBy: { full_name: 'asc' }
    });

    const emails = students.map(s => s.parent_email).filter(Boolean) as string[];
    const parents = emails.length > 0
      ? await prisma.user.findMany({
          where: { email: { in: emails }, role: 'parent' },
          select: { email: true, user_id_no: true, full_name: true }
        })
      : [];
    const parentMap = new Map(parents.map(p => [p.email, p]));

    return students.map(s => {
      const p = s.parent_email ? parentMap.get(s.parent_email) : null;
      return {
        ...s,
        parent_id_no: p?.user_id_no ?? null,
        parent_name: p?.full_name ?? s.parent_name ?? null,
      };
    });
  }

  static async getNextStudentId(): Promise<string> {
    const lastStudent = await prisma.student.findFirst({
      orderBy: { student_id_no: 'desc' },
      select: { student_id_no: true }
    });
    
    let nextNum = 1;
    if (lastStudent && lastStudent.student_id_no.startsWith('S-')) {
      const lastNum = parseInt(lastStudent.student_id_no.replace('S-', ''), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    
    return `S-${String(nextNum).padStart(6, '0')}`;
  }

  static async uploadStudentPhoto(file: Buffer, mimetype: string, filename: string): Promise<string> {
    const ext = mimetype.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const path = `students/${Date.now()}-${filename.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('universe-assets')
      .upload(path, file, { contentType: mimetype, upsert: true });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('universe-assets')
      .getPublicUrl(path);

    return publicUrl;
  }
  static async updateStudent(id: string, input: UpdateStudentInput) {
    const data: any = { ...input };
    if (input.date_of_birth) {
      data.date_of_birth = new Date(input.date_of_birth);
    }
    const student = await prisma.student.update({
      where: { student_id_no: id },
      data,
      include: {
        class: {
          include: {
            school_grade: true,
            teacher: { select: { id: true, full_name: true } }
          }
        }
      }
    });

    if (student.parent_email) {
      const parent = await prisma.user.findFirst({
        where: { email: student.parent_email, role: 'parent' },
        select: { user_id_no: true, full_name: true }
      });
      return {
        ...student,
        parent_id_no: parent?.user_id_no ?? null,
        parent_name: parent?.full_name ?? student.parent_name ?? null,
      };
    }

    return { ...student, parent_id_no: null, parent_name: student.parent_name ?? null };
  }

  static async deleteStudent(id: string) {
    const student = await prisma.student.findUnique({
      where: { student_id_no: id },
      select: { id: true }
    });

    if (!student) {
      throw new Error(`Student with ID ${id} not found`);
    }

    return prisma.student.delete({
      where: { id: student.id }
    });
  }

  static async getOverviewStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [activeStudents, suspendedStudents, suspendedUsers, attendanceCount, yesterdayCount] = await Promise.all([
      prisma.student.count({ where: { is_active: true } }),
      prisma.student.count({ where: { is_active: false } }),
      prisma.user.count({
        where: {
          OR: [
            { is_suspended: true },
            { is_active: false }
          ],
          role: { not: 'pending' }
        }
      }),
      prisma.attendanceRecord.count({
        where: { date: today, status: 'present' }
      }),
      prisma.attendanceRecord.count({
        where: { date: yesterday, status: 'present' }
      }),
    ]);

    return {
      activeStudents,
      suspendedStudents,
      lockedAccounts: suspendedStudents + suspendedUsers,
      todayAttendance: attendanceCount,
      yesterdayAttendance: yesterdayCount,
    };
  }
}