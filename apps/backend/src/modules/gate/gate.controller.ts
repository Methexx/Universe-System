import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { ScanQrInput } from './gate.schema';
import { getOrSetCache, delCacheByPattern } from '../../common/utils/cache';
import { sendFcmNotification } from '../../config/firebase';

export class GateController {
  
  // POST /api/gate/scan
  static async scanStudentCode(
    request: FastifyRequest<{ Body: ScanQrInput }>,
    reply: FastifyReply
  ) {
    try {
      const { qr_code, direction, method, manual_reason } = request.body;
      const user = (request as any).user; // from @fastify/jwt payload

      // 1. Find the student by QR Code
      const student = await prisma.student.findUnique({
        where: { qr_code },
        include: {
          class: {
            include: {
              school_grade: true
            }
          }
        }
      });

      if (!student) {
        return reply.status(404).send({
          success: false,
          message: 'Student not found or invalid QR code'
        });
      }

      if (!student.is_active) {
        return reply.status(403).send({
          success: false,
          message: 'Student record is inactive'
        });
      }

      // 2. Optional: We can check if they are already IN and trying to scan IN again, 
      // but for V1 we'll trust the security guard's button press.

      // 3. Create the Event
      const gateEvent = await prisma.gateEvent.create({
        data: {
          student_id: student.id,
          scanned_by_id: user.userId, // Using the logged-in security/admin ID
          direction: direction,
          method: method || 'qr',
          manual_reason: manual_reason || null
        }
      });

      // Invalidate gate caches on every scan
      await delCacheByPattern('gate:*');

      // 4. Notify linked parent via FCM (fire-and-forget — never block the scan response)
      try {
        const parentLink = await prisma.parentStudent.findFirst({
          where: { student_id: student.id },
          select: { parent: { select: { fcm_token: true } } },
        });
        const fcmToken = (parentLink as any)?.parent?.fcm_token;
        if (fcmToken) {
          const isIn = direction === 'IN';
          await sendFcmNotification(
            fcmToken,
            isIn ? '✅ Student Arrived' : '🚶 Student Left School',
            isIn
              ? `${student.full_name} has entered the school.`
              : `${student.full_name} has left the school.`,
            { type: 'gate_event', direction, student_id: student.id }
          );
        }
      } catch (_notifErr) {
        // Notification failure must never fail the scan response
      }

      // 5. Return success to display on the security app screen
      return reply.status(200).send({
        success: true,
        message: `Successfully checked ${direction}`,
        data: {
          event: gateEvent,
          student: {
            id: student.id,
            full_name: student.full_name,
            student_id_no: student.student_id_no,
            photo_url: student.photo_url,
            class_name: (student as any).class?.name || null,
            grade_name: (student as any).class?.school_grade?.name || null
          }
        }
      });

    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error during gate scan',
        error: error.message
      });
    }
  }

  // GET /api/gate/student?id=S-000004
  static async getStudentByIdNo(
    request: FastifyRequest<{ Querystring: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const student_id_no = request.query.id;

      const student = await prisma.student.findFirst({
        where: { student_id_no },
        include: {
          class: {
            include: {
              school_grade: true,
              teacher: { select: { id: true, full_name: true, email: true } }
            }
          }
        }
      });

      if (!student) {
        return reply.status(404).send({ success: false, message: 'Student not found' });
      }

      return reply.status(200).send({ success: true, data: student });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  }

  // GET /api/gate/search?q=000
  static async searchStudents(
    request: FastifyRequest<{ Querystring: { q: string } }>,
    reply: FastifyReply
  ) {
    try {
      const query = request.query.q || '';
      if (!query.trim()) {
        return reply.status(200).send({ success: true, data: [] });
      }

      const students = await prisma.student.findMany({
        where: {
          OR: [
            { full_name: { contains: query, mode: 'insensitive' } },
            { student_id_no: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        include: {
          class: {
            include: {
              school_grade: true,
              teacher: { select: { id: true, full_name: true, email: true } }
            }
          }
        }
      });

      return reply.status(200).send({ success: true, data: students });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  }

  // GET /api/gate/stats
  static async getStats(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const data = await getOrSetCache('gate:stats', async () => {
        const [checkIns, manualEntries, qrScans] = await Promise.all([
          prisma.gateEvent.count({ where: { direction: 'IN',   timestamp: { gte: todayStart } } }),
          prisma.gateEvent.count({ where: { method: 'manual', timestamp: { gte: todayStart } } }),
          prisma.gateEvent.count({ where: { method: 'qr',     timestamp: { gte: todayStart } } }),
        ]);

        const latestPerStudent = await prisma.gateEvent.findMany({
          where: { timestamp: { gte: todayStart } },
          orderBy: { timestamp: 'desc' },
          distinct: ['student_id'],
          select: { student_id: true, direction: true },
        });
        const currentlyInside = latestPerStudent.filter(e => e.direction === 'IN').length;

        return { checkIns, manualEntries, qrScans, currentlyInside };
      }, 60);

      return reply.status(200).send({ success: true, data });
    } catch (error: any) {
      _request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error fetching stats' });
    }
  }

  // GET /api/gate/events
  static async getRecentEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit = '100', method, date, class_id } = request.query as any;
      const cacheKey = `gate:events:${date ?? 'all'}:${method ?? 'all'}:${class_id ?? 'all'}:${limit}`;

      const data = await getOrSetCache(cacheKey, async () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const weekAgoStart = new Date(todayStart);
        weekAgoStart.setDate(weekAgoStart.getDate() - 6);
        let timestampFilter: any = { gte: weekAgoStart };
        if (date === 'today')     timestampFilter = { gte: todayStart };
        if (date === 'yesterday') timestampFilter = { gte: yesterdayStart, lt: todayStart };
        if (date && date !== 'today' && date !== 'yesterday') {
          const specificDate = new Date(date);
          specificDate.setHours(0, 0, 0, 0);
          const specificDateEnd = new Date(specificDate);
          specificDateEnd.setDate(specificDateEnd.getDate() + 1);
          timestampFilter = { gte: specificDate, lt: specificDateEnd };
        }

        const whereClause: any = { timestamp: timestampFilter };
        if (method) whereClause.method = method;
        if (class_id) whereClause.student = { class_id };

        const events = await prisma.gateEvent.findMany({
          where: whereClause,
          orderBy: { timestamp: 'desc' },
          take: parseInt(limit),
          include: { student: { select: { student_id_no: true, full_name: true } } },
        });

        const grouped: Record<string, {
          id: string; student_id_no: string; full_name: string;
          date: string; timeLabel: string; checkIn: string | null; checkOut: string | null; method: string;
        }> = {};

        for (const e of events) {
          const d = new Date(e.timestamp);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const key = `${e.student_id}__${dateStr}`;
          const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const isToday     = d >= todayStart;
          const isYesterday = d >= yesterdayStart && d < todayStart;
          const timeLabel   = isToday ? 'Today' : isYesterday ? 'Yesterday' : dateStr;

          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              student_id_no: (e.student as any)?.student_id_no ?? '—',
              full_name: (e.student as any)?.full_name ?? '—',
              date: dateStr, timeLabel, checkIn: null, checkOut: null, method: e.method,
            };
          }
          if (e.direction === 'IN'  && !grouped[key].checkIn)  grouped[key].checkIn  = timeStr;
          if (e.direction === 'OUT' && !grouped[key].checkOut) grouped[key].checkOut = timeStr;
        }

        return Object.values(grouped);
      }, 60);

      return reply.status(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error fetching gate events' });
    }
  }

  // GET /api/gate/stats/timeseries?range=today|week|30days
  static async getTimeseries(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { range = 'week' } = request.query as { range?: string };

      const data = await getOrSetCache(`gate:timeseries:${range}`, async () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (range === 'today') {
          const tomorrowStart = new Date(todayStart);
          tomorrowStart.setDate(tomorrowStart.getDate() + 1);

          // Single query: group by hour
          const rows = await prisma.$queryRaw<{ bucket: Date; count: bigint }[]>`
            SELECT DATE_TRUNC('hour', timestamp) AS bucket, COUNT(*) AS count
            FROM gate_events
            WHERE direction = 'IN'
              AND timestamp >= ${todayStart}
              AND timestamp < ${tomorrowStart}
            GROUP BY bucket
            ORDER BY bucket
          `;
          const countMap = new Map(rows.map(r => [r.bucket.getUTCHours(), Number(r.count)]));

          return Array.from({ length: 24 }, (_, h) => ({
            name: h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`,
            uv: countMap.get(h) ?? 0,
          }));
        }

        const days = range === 'week' ? 7 : 30;
        const rangeStart = new Date(todayStart);
        rangeStart.setDate(rangeStart.getDate() - (days - 1));
        const rangeEnd = new Date(todayStart);
        rangeEnd.setDate(rangeEnd.getDate() + 1);

        // Single query: group by day
        const rows = await prisma.$queryRaw<{ bucket: Date; count: bigint }[]>`
          SELECT DATE_TRUNC('day', timestamp) AS bucket, COUNT(*) AS count
          FROM gate_events
          WHERE direction = 'IN'
            AND timestamp >= ${rangeStart}
            AND timestamp < ${rangeEnd}
          GROUP BY bucket
          ORDER BY bucket
        `;
        const countMap = new Map(rows.map(r => [r.bucket.toISOString().slice(0, 10), Number(r.count)]));

        return Array.from({ length: days }, (_, i) => {
          const d = new Date(rangeStart);
          d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          const label = days === 7
            ? d.toLocaleDateString('en-US', { weekday: 'short' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return { name: label, uv: countMap.get(key) ?? 0 };
        });
      }, 120);

      return reply.status(200).send({ success: true, data });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error fetching timeseries' });
    }
  }
  // GET /api/gate/my-child-events  (parent role)
  static async getMyChildEvents(request: FastifyRequest, reply: FastifyReply) {
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

      // 2. Total count for pagination
      const total = await prisma.gateEvent.count({ where: { student_id: studentId } });

      // 3. Fetch paginated events ordered newest first
      const events = await prisma.gateEvent.findMany({
        where: { student_id: studentId },
        orderBy: { timestamp: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          direction: true,
          method: true,
          timestamp: true,
        },
      });

      // 4. Also compute current status (latest event direction)
      const latest = await prisma.gateEvent.findFirst({
        where: { student_id: studentId },
        orderBy: { timestamp: 'desc' },
        select: { direction: true },
      });

      const isInsideSchool = latest?.direction === 'IN';

      return reply.status(200).send({
        success: true,
        data: {
          is_inside_school: isInsideSchool,
          events,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            has_more: pageNum * limitNum < total,
          },
        },
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  }
}
