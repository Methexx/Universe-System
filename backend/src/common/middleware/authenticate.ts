import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Attach user payload to request
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
