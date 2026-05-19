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

  static async getClassStudents(classId: string) {
    return prisma.student.findMany({
      where: { class_id: classId },
      include: {
        class: {
          include: {
            school_grade: { select: { id: true, name: true } },
            teacher: { select: { id: true, full_name: true } }
          }
        }
      },
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

    const emails = students.map((s: { parent_email: string | null }) => s.parent_email).filter(Boolean) as string[];
    const parents: { email: string | null; user_id_no: string | null; full_name: string | null }[] = emails.length > 0
      ? await prisma.user.findMany({
          where: { email: { in: emails }, role: 'parent' },
          select: { email: true, user_id_no: true, full_name: true }
        })
      : [];
    const parentMap = new Map(parents.map((p: { email: string | null; user_id_no: string | null; full_name: string | null }) => [p.email, p]));

    return students.map((s: (typeof students)[number]) => {
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

  static async getOverviewStats(classId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [activeStudents, suspendedStudents, todayGateCheckIns, yesterdayGateCheckIns, todayClassroomPresent] = await Promise.all([
      prisma.student.count({ where: { is_active: true, ...(classId ? { class_id: classId } : {}) } }),
      // Suspended students = students with is_active: false
      prisma.student.count({ where: { is_active: false, ...(classId ? { class_id: classId } : {}) } }),
      // Gate check-ins as the attendance figure (matches attendance page stat card)
      prisma.gateEvent.count({ where: { direction: 'IN', timestamp: { gte: today }, ...(classId ? { student: { class_id: classId } } : {}) } }),
      prisma.gateEvent.count({ where: { direction: 'IN', timestamp: { gte: yesterday, lt: today }, ...(classId ? { student: { class_id: classId } } : {}) } }),
      // Classroom present/late marks
      prisma.attendanceRecord.count({ where: { date: { gte: today }, status: { in: ['present', 'late'] }, ...(classId ? { student: { class_id: classId } } : {}) } }),
    ]);

    return {
      activeStudents,
      suspendedStudents,
      // lockedAccounts = suspended students only (shown in the "Suspended Accounts" stat card)
      lockedAccounts: suspendedStudents,
      todayAttendance: todayGateCheckIns,
      yesterdayAttendance: yesterdayGateCheckIns,
      todayClassroomPresent,
    };
  }

  static async getRecentActivity() {
    const recentStudents = await prisma.student.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { class: true }
    });

    const recentGateEvents = await prisma.gateEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5,
      include: { student: { include: { class: true } } }
    });

    const activities = [
      ...recentStudents.map((s: (typeof recentStudents)[number]) => ({
        type: 'registration',
        id: `reg-${s.id}`,
        timestamp: s.created_at,
        title: 'New Student Registration',
        details: `Name - ${s.full_name}   SID - ${s.student_id_no}   class - ${s.class?.name ?? 'Unassigned'}`,
      })),
      ...recentGateEvents.map((g: (typeof recentGateEvents)[number]) => ({
        type: 'gate_log',
        id: `gate-${g.id}`,
        timestamp: g.timestamp,
        title: `Gate ${g.direction === 'IN' ? 'Check-in' : 'Check-out'} (${g.method})`,
        details: `Name - ${g.student.full_name}   SID - ${g.student.student_id_no}   class - ${g.student.class?.name ?? 'Unassigned'}`,
      }))
    ];

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, 5);
  }
}