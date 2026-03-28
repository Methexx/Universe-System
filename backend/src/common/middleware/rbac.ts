import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Validates if the authenticated user has one of the required roles.
 * Must be used AFTER the `authenticate` middleware.
 */
export const authorize = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    if (!user) {
      return reply.status(401).send({ success: false, message: 'Unauthorized: User not found in request' });
    }

    if (!allowedRoles.includes(user.role)) {
      return reply.status(403).send({ 
        success: false, 
        message: `Forbidden: Insufficient permissions. Required one of: ${allowedRoles.join(', ')}` 
      });
    }
  };
};
