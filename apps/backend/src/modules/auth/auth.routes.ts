import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import {
  forgotPasswordSchema,
  linkChildSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  updateFcmTokenSchema,
  verifyOtpSchema,
} from './auth.schema';
import { authenticate } from '../../common/middleware/authenticate';

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

  fastify.post('/resend-otp', {
    preHandler: async (request) => {
      resendOtpSchema.parse({ body: request.body });
    },
  }, AuthController.resendOtp);

  fastify.post('/forgot-password', {
    preHandler: async (request) => {
      forgotPasswordSchema.parse({ body: request.body });
    },
  }, AuthController.forgotPassword);

  fastify.post('/reset-password', {
    preHandler: async (request) => {
      resetPasswordSchema.parse({ body: request.body });
    },
  }, AuthController.resetPassword);

  fastify.put('/link-child', {
    preHandler: async (request) => {
      linkChildSchema.parse({ body: request.body });
    },
  }, AuthController.linkChild);

  fastify.post('/refresh', {
    preHandler: [authenticate],
  }, AuthController.refresh);

  fastify.post('/logout', {
    preHandler: [authenticate],
  }, AuthController.logout);

  fastify.post('/logout-all', {
    preHandler: [authenticate],
  }, AuthController.logoutAll);

  fastify.put('/fcm-token', {
    preHandler: [
      authenticate,
      async (request) => {
        updateFcmTokenSchema.parse({ body: request.body });
      },
    ],
  }, AuthController.updateFcmToken);

  fastify.get('/me', {
    preHandler: [authenticate],
  }, AuthController.me);
}
