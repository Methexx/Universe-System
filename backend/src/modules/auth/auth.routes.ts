import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { registerSchema, verifyOtpSchema, loginSchema } from './auth.schema';

const zodToJsonSchema = (schema: any) => {
  // Simple mapping or use a library like zod-to-json-schema if needed
  // For Fastify schema validation, we will create preHandler with Zod.
  return {};
};

// Fastify routes
export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    preHandler: async (request, reply) => {
      try {
        registerSchema.parse({ body: request.body });
      } catch (error) {
        throw error;
      }
    }
  }, AuthController.register);

  fastify.post('/verify-otp', {
    preHandler: async (request, reply) => {
      try {
        verifyOtpSchema.parse({ body: request.body });
      } catch (error) {
        throw error;
      }
    }
  }, AuthController.verifyOtp);

  fastify.post('/login', {
    preHandler: async (request, reply) => {
      try {
        loginSchema.parse({ body: request.body });
      } catch (error) {
        throw error;
      }
    }
  }, AuthController.login);
}
