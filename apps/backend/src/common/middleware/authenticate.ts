import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../../config/prisma';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : (request.cookies as any)?.auth_token;

    if (!token) {
      return reply.status(401).send({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const decoded = verifyToken(token) as any;

    // Always use the fresh role from DB so promotions take effect without re-login
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, is_active: true },
    });

    if (!dbUser) {
      return reply.status(401).send({ success: false, message: 'Unauthorized: User no longer exists' });
    }

    // Update last seen
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { last_seen: new Date() },
    }).catch(() => {});

    (request as any).user = { ...decoded, role: dbUser.role };
  } catch (error) {
    return reply.status(401).send({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
