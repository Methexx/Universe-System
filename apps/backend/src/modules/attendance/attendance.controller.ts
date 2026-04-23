import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../config/prisma';
import { markAttendanceSchema, getAttendanceSchema } from './attendance.schema';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';

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