import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../../config/prisma';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function findUserWithRetry(userId: string, retries = 2, delayMs = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, is_active: true },
      });
    } catch (err: any) {
      const isConnErr = err?.message?.includes("Can't reach database");
      if (!isConnErr || attempt === retries) throw err;
      await sleep(delayMs * (attempt + 1));
    }
  }
}

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

    let dbUser: { role: string; is_active: boolean } | null | undefined;
    try {
      dbUser = await findUserWithRetry(decoded.userId);
    } catch (err: any) {
      if (err?.message?.includes("Can't reach database")) {
        return reply.status(503).send({ success: false, message: 'Service temporarily unavailable. Please try again.' });
      }
      throw err;
    }

    if (!dbUser) {
      return reply.status(401).send({ success: false, message: 'Unauthorized: User no longer exists' });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { last_seen: new Date() },
    }).catch(() => {});

    (request as any).user = { ...decoded, role: dbUser.role };
  } catch (error) {
    return reply.status(401).send({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
