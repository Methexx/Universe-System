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

  // GET /api/gate/events
  // Allows admins/security to see the recent scans
  static async getRecentEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit = '50', student_id } = request.query as any;

      const whereClause = student_id ? { student_id } : {};

      const events = await prisma.gateEvent.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        include: {
          student: {
            select: { full_name: true, student_id_no: true }
          },
          scanned_by: {
            select: { full_name: true, role: true }
          }
        }
      });

      return reply.status(200).send({
        success: true,
        data: events
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error fetching gate events'
      });
    }
  }
}
