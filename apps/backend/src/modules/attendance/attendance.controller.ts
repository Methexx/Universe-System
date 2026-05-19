import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import {
  markAttendanceSchema,
  getAttendanceSchema,
  createSessionSchema,
  getSessionSchema,
  submitSessionSchema,
  getSessionDatesSchema,
  getAttendanceSummarySchema,
} from './attendance.schema';
import { delCacheByPattern, getOrSetCache, getCache, setCache, delCache } from '../../common/utils/cache';
import { notifyUser } from '../notifications/notifications.service';

export const getMyChildAttendance = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user as { userId: string };
    const { page = '1', limit = '20' } = request.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    // 1. Find the child linked to this parent
    const parentLink = await prisma.parentStudent.findFirst({
      where: { parent_id: user.userId },
      select: { student_id: true },
    });

    if (!parentLink) {
      return reply.status(404).send({ success: false, message: 'No child linked to this account' });
    }

    const studentId = parentLink.student_id;

    // 2. Fetch paginated distinct dates from both tables
    const countQuery = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM (
        SELECT DATE(date) as d FROM attendance_records WHERE student_id = ${studentId}::uuid
        UNION
        SELECT DATE(timestamp) as d FROM gate_events WHERE student_id = ${studentId}::uuid
      ) as sub
    `;
    const total = Number(countQuery[0]?.count || 0);

    const datesQuery = await prisma.$queryRaw<{d: Date}[]>`
      SELECT d FROM (
        SELECT DATE(date) as d FROM attendance_records WHERE student_id = ${studentId}::uuid
        UNION
        SELECT DATE(timestamp) as d FROM gate_events WHERE student_id = ${studentId}::uuid
      ) as sub
      ORDER BY d DESC
      LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}
    `;

    // 3. For each date, fetch the attendance record and gate event status
    const recordsWithGate = await Promise.all(datesQuery.map(async (row) => {
      // row.d is the date (midnight). We query between start and end of that day.
      const dateStart = new Date(row.d);
      dateStart.setUTCHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

      // Check attendance record
      const attRecord = await prisma.attendanceRecord.findFirst({
        where: {
          student_id: studentId,
          date: { gte: dateStart, lt: dateEnd },
        },
      });

      // Check gate in event
      const gateInEvent = await prisma.gateEvent.findFirst({
        where: {
          student_id: studentId,
          direction: 'IN',
          timestamp: { gte: dateStart, lt: dateEnd },
        },
      });

      return {
        id: attRecord?.id || `gate_${dateStart.getTime()}`,
        student_id: studentId,
        date: dateStart.toISOString(),
        status: attRecord?.status || (gateInEvent ? 'unmarked' : 'absent'),
        remarks: attRecord?.remarks || null,
        gateIn: !!gateInEvent,
      };
    }));

    // 4. Get current gate status
    const latestGateEvent = await prisma.gateEvent.findFirst({
      where: { student_id: studentId },
      orderBy: { timestamp: 'desc' },
      select: { direction: true },
    });

    return reply.status(200).send({
      success: true,
      data: {
        isInsideSchool: latestGateEvent?.direction === 'IN',
        records: recordsWithGate,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          hasMore: pageNum * limitNum < total,
        },
      },
    });
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while fetching child attendance.' });
  }
};

export const markAttendance = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = markAttendanceSchema.parse(request.body);
    const user = (request as any).user;

    const parsedDate = new Date(data.date);

    const record = await prisma.attendanceRecord.upsert({
      where: {
        student_id_date: {
          student_id: data.student_id,
          date: parsedDate
        }
      },
      update: {
        status: data.status,
        remarks: data.remarks,
        marked_by_id: user.id
      },
      create: {
        student_id: data.student_id,
        date: parsedDate,
        status: data.status,
        remarks: data.remarks,
        marked_by_id: user.id
      }
    });

    await delCacheByPattern('attendance:*');

    // Notify the linked parent (in-app notification + push)
    try {
      const link = await prisma.parentStudent.findFirst({
        where: { student_id: data.student_id },
        select: { parent_id: true, student: { select: { full_name: true } } },
      });
      if (link?.parent_id) {
        await notifyUser(link.parent_id, {
          type: 'attendance',
          title: 'Attendance Updated',
          body: `${link.student?.full_name ?? 'Your child'} was marked ${data.status} today.`,
          data: { route: '/attendance' },
        });
      }
    } catch (notifyErr) {
      request.log.error(notifyErr);
    }

    return reply.status(200).send({
      success: true,
      message: `Attendance marked as ${data.status} successfully`,
      data: record
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw error; // Let the global error handler catch Zod validation errors
    }
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while marking attendance.' });
  }
};

export const getAttendance = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Cast and parse
    const query = getAttendanceSchema.parse(request.query);
    
    // Default to today if date not provided
    const dateFilter = query.date ? new Date(query.date) : new Date(new Date().setUTCHours(0,0,0,0));

    const cacheKey = `attendance:${query.date ?? 'today'}:${query.class_id ?? 'all'}`;

    const records = await getOrSetCache(cacheKey, () =>
      prisma.attendanceRecord.findMany({
        where: {
          date: dateFilter,
          ...(query.class_id ? { student: { class_id: query.class_id } } : {})
        },
        include: {
          student: {
            select: { full_name: true, student_id_no: true }
          },
          marked_by: {
            select: { full_name: true, role: true }
          }
        },
        orderBy: { created_at: 'desc' }
      })
    );

    return reply.status(200).send({
      success: true,
      data: records
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw error;
    }
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while fetching attendance.' });
  }
};

// ── 2a. POST /api/attendance/session ─────────────────────────────────────────
export const createSession = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { class_id } = createSessionSchema.parse(request.body);
    const user = (request as any).user;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.attendanceSession.findUnique({
      where: { class_id_date: { class_id, date: today } },
    });

    if (existing) {
      return reply.status(200).send({ success: true, data: { session: existing, alreadyExists: true } });
    }

    const session = await prisma.attendanceSession.create({
      data: { class_id, teacher_id: user.userId, date: today },
    });

    // Invalidate session cache
    await delCache(`attendance-session:${class_id}:${today.toISOString().split('T')[0]}`);

    return reply.status(201).send({ success: true, data: { session, alreadyExists: false } });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while creating the session.' });
  }
};

// ── 2b. GET /api/attendance/session ──────────────────────────────────────────
export const getSession = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getSessionSchema.parse(request.query);
    const dateStr = query.date ?? new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const cacheKey = `attendance-session:${query.class_id}:${dateStr}`;

    const result = await getOrSetCache(
      cacheKey,
      async () => {
        const session = await prisma.attendanceSession.findUnique({
          where: { class_id_date: { class_id: query.class_id, date } },
        });

        if (!session) return { session: null, records: [] };

        const records = await prisma.attendanceRecord.findMany({
          where: { session_id: session.id },
          include: {
            student: {
              select: { id: true, full_name: true, student_id_no: true, photo_url: true },
            },
          },
          orderBy: { student: { full_name: 'asc' } },
        });

        return { session, records };
      },
      30,
    );

    return reply.status(200).send({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while fetching the session.' });
  }
};

// ── 2c. POST /api/attendance/session/submit ───────────────────────────────────
export const submitSession = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { session_id, marks } = submitSessionSchema.parse(request.body);
    const user = (request as any).user;

    const session = await prisma.attendanceSession.findUnique({
      where: { id: session_id },
    });

    if (!session) {
      return reply.status(404).send({ success: false, message: 'Session not found.' });
    }

    // Midnight lock: session date must equal today (UTC)
    const sessionDateStr = new Date(session.date).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    if (sessionDateStr < todayStr) {
      return reply.status(403).send({
        success: false,
        message: 'Session is no longer editable after midnight.',
      });
    }

    // Batch upsert all marks
    const sessionDate = new Date(session.date);
    sessionDate.setUTCHours(0, 0, 0, 0);

    await Promise.all(
      marks.map((mark) =>
        prisma.attendanceRecord.upsert({
          where: { student_id_date: { student_id: mark.student_id, date: sessionDate } },
          create: {
            student_id: mark.student_id,
            date: sessionDate,
            status: mark.status,
            session_id,
            marked_by_id: user.userId,
            remarks: mark.remarks,
          },
          update: {
            status: mark.status,
            remarks: mark.remarks,
            marked_by_id: user.userId,
          },
        }),
      ),
    );

    // Invalidate caches
    await Promise.all([
      delCache(`attendance-session:${session.class_id}:${sessionDateStr}`),
      delCacheByPattern(`attendance:${sessionDateStr}:${session.class_id}`),
      delCacheByPattern(`attendance-summary:${session.class_id}:*`),
    ]);

    // Notify the linked parent of each marked student (in-app notification + push)
    try {
      const studentIds = marks.map((m) => m.student_id);
      const links = await prisma.parentStudent.findMany({
        where: { student_id: { in: studentIds } },
        select: { parent_id: true, student_id: true, student: { select: { full_name: true } } },
      });
      const statusByStudent = new Map(marks.map((m) => [m.student_id, m.status]));
      for (const link of links) {
        await notifyUser(link.parent_id, {
          type: 'attendance',
          title: 'Attendance Updated',
          body: `${link.student?.full_name ?? 'Your child'} was marked ${statusByStudent.get(link.student_id)} today.`,
          data: { route: '/attendance' },
        });
      }
    } catch (notifyErr) {
      request.log.error(notifyErr);
    }

    return reply.status(200).send({
      success: true,
      data: { saved: marks.length, date: sessionDateStr, class_id: session.class_id },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while submitting the session.' });
  }
};

// ── 2d. GET /api/attendance/session/dates ─────────────────────────────────────
export const getSessionDates = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getSessionDatesSchema.parse(request.query);
    const { class_id, year, month } = query;

    const cacheKey = `attendance-session-dates:${class_id}:${year}-${month}`;

    const dates = await getOrSetCache(
      cacheKey,
      async () => {
        const start = new Date(Date.UTC(year, month - 1, 1));
        const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

        const sessions = await prisma.attendanceSession.findMany({
          where: {
            class_id,
            date: { gte: start, lte: end },
          },
          select: { date: true },
          orderBy: { date: 'asc' },
        });

        return sessions.map((s) => new Date(s.date).toISOString().split('T')[0]);
      },
      60,
    );

    return reply.status(200).send({ success: true, data: dates });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while fetching session dates.' });
  }
};

// ── 2e. GET /api/attendance/summary ──────────────────────────────────────────
export const getAttendanceSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = getAttendanceSummarySchema.parse(request.query);
    const { class_id, range } = query;
    const now = new Date();
    const year = query.year ?? now.getUTCFullYear();
    const month = query.month ?? now.getUTCMonth() + 1;

    const cacheKey = `attendance-summary:${class_id}:${range}:${year}-${month}`;

    const summary = await getOrSetCache(
      cacheKey,
      async () => {
        let start: Date;
        let end: Date;

        if (range === 'term') {
          // Rough term: Jan-Apr | May-Aug | Sep-Dec
          const termStart = month <= 4 ? 1 : month <= 8 ? 5 : 9;
          start = new Date(Date.UTC(year, termStart - 1, 1));
          end = new Date(Date.UTC(year, termStart + 2, 0, 23, 59, 59));
        } else {
          start = new Date(Date.UTC(year, month - 1, 1));
          end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        }

        // Count total sessions in range
        const totalSessions = await prisma.attendanceSession.count({
          where: { class_id, date: { gte: start, lte: end } },
        });

        // Get all students in this class
        const students = await prisma.student.findMany({
          where: { class_id, is_active: true },
          select: { id: true, full_name: true, student_id_no: true, photo_url: true },
          orderBy: { full_name: 'asc' },
        });

        // For each student count records in date range by status
        const summaryRows = await Promise.all(
          students.map(async (student) => {
            const records = await prisma.attendanceRecord.groupBy({
              by: ['status'],
              where: {
                student_id: student.id,
                date: { gte: start, lte: end },
              },
              _count: { status: true },
            });

            const countOf = (s: string) =>
              records.find((r) => r.status === s)?._count.status ?? 0;

            const present = countOf('present');
            const late = countOf('late');
            const absent = countOf('absent');
            const rate =
              totalSessions > 0
                ? Math.round(((present + late) / totalSessions) * 100 * 10) / 10
                : 0;

            return {
              student_id: student.id,
              full_name: student.full_name,
              student_id_no: student.student_id_no,
              photo_url: student.photo_url,
              present,
              absent,
              late,
              total_sessions: totalSessions,
              rate,
            };
          }),
        );

        return summaryRows;
      },
      120,
    );

    return reply.status(200).send({ success: true, data: summary });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') throw error;
    request.log.error(error);
    reply.status(500).send({ success: false, message: 'An error occurred while fetching the summary.' });
  }
};