import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { ScanQrInput } from './gate.schema';

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

      // 4. Return success to display on the security app screen
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

      const [checkIns, manualEntries, qrScans] = await Promise.all([
        prisma.gateEvent.count({ where: { direction: 'IN',     timestamp: { gte: todayStart } } }),
        prisma.gateEvent.count({ where: { method: 'manual',   timestamp: { gte: todayStart } } }),
        prisma.gateEvent.count({ where: { method: 'qr',       timestamp: { gte: todayStart } } }),
      ]);

      const latestPerStudent = await prisma.gateEvent.findMany({
        where: { timestamp: { gte: todayStart } },
        orderBy: { timestamp: 'desc' },
        distinct: ['student_id'],
        select: { student_id: true, direction: true },
      });
      const currentlyInside = latestPerStudent.filter(e => e.direction === 'IN').length;

      return reply.status(200).send({
        success: true,
        data: { checkIns, manualEntries, qrScans, currentlyInside },
      });
    } catch (error: any) {
      _request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error fetching stats' });
    }
  }

  // GET /api/gate/events
  static async getRecentEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit = '100', method, date, class_id } = request.query as any;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const weekAgoStart = new Date(todayStart);
      weekAgoStart.setDate(weekAgoStart.getDate() - 6);
      let timestampFilter: any = { gte: weekAgoStart }; // default: last 7 days
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
        include: {
          student: { select: { student_id_no: true, full_name: true } },
        },
      });

      // Group by student_id + date so each row shows one IN + one OUT
      const grouped: Record<string, {
        id: string;
        student_id_no: string;
        full_name: string;
        date: string;
        timeLabel: string;
        checkIn: string | null;
        checkOut: string | null;
        method: string;
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
            date: dateStr,
            timeLabel,
            checkIn: null,
            checkOut: null,
            method: e.method,
          };
        }

        if (e.direction === 'IN'  && !grouped[key].checkIn)  grouped[key].checkIn  = timeStr;
        if (e.direction === 'OUT' && !grouped[key].checkOut) grouped[key].checkOut = timeStr;
        // keep the method of the first (latest) event
      }

      return reply.status(200).send({ success: true, data: Object.values(grouped) });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error fetching gate events' });
    }
  }

  // GET /api/gate/stats/timeseries?range=today|week|30days
  static async getTimeseries(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { range = 'week' } = request.query as { range?: string };

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      if (range === 'today') {
        // Hourly buckets for today: 0AM to 23PM
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const buckets = await Promise.all(
          hours.map(async (h) => {
            const from = new Date(todayStart);
            from.setHours(h, 0, 0, 0);
            const to = new Date(todayStart);
            to.setHours(h + 1, 0, 0, 0);
            const count = await prisma.gateEvent.count({
              where: { direction: 'IN', timestamp: { gte: from, lt: to } },
            });
            const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
            return { name: label, uv: count };
          })
        );
        return reply.status(200).send({ success: true, data: buckets });
      }

      if (range === 'week') {
        // Daily buckets for last 7 days
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(todayStart);
          d.setDate(d.getDate() - (6 - i));
          return d;
        });
        const buckets = await Promise.all(
          days.map(async (day) => {
            const nextDay = new Date(day);
            nextDay.setDate(nextDay.getDate() + 1);
            const count = await prisma.gateEvent.count({
              where: { direction: 'IN', timestamp: { gte: day, lt: nextDay } },
            });
            const label = day.toLocaleDateString('en-US', { weekday: 'short' });
            return { name: label, uv: count };
          })
        );
        return reply.status(200).send({ success: true, data: buckets });
      }

      // 30 days — daily buckets
      const days30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(todayStart);
        d.setDate(d.getDate() - (29 - i));
        return d;
      });
      const buckets30 = await Promise.all(
        days30.map(async (day) => {
          const nextDay = new Date(day);
          nextDay.setDate(nextDay.getDate() + 1);
          const count = await prisma.gateEvent.count({
            where: { direction: 'IN', timestamp: { gte: day, lt: nextDay } },
          });
          const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return { name: label, uv: count };
        })
      );
      return reply.status(200).send({ success: true, data: buckets30 });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error fetching timeseries' });
    }
  }
}
