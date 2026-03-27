import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const errorHandler = (error: FastifyError | ZodError | any, request: FastifyRequest, reply: FastifyReply) => {
  request.log.error(error);

  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: 'Validation error',
      errors: error.issues,
    });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
