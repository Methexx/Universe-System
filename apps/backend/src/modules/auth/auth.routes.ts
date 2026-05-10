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
  changePasswordSchema,
  completeRegistrationSchema,
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
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    },
    preHandler: async (request) => {
      registerSchema.parse({ body: request.body });
    }
  }, AuthController.register);

  fastify.post('/verify-otp', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    preHandler: async (request) => {
      verifyOtpSchema.parse({ body: request.body });
    }
  }, AuthController.verifyOtp);

  fastify.post('/complete-registration', {
    preHandler: async (request) => {
      completeRegistrationSchema.parse({ body: request.body });
    }
  }, AuthController.completeRegistration);

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 15,
        timeWindow: '1 minute'
      }
    },
    preHandler: async (request) => {
      loginSchema.parse({ body: request.body });
    }
  }, AuthController.login);

  fastify.post('/resend-otp', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute'
      }
    },
    preHandler: async (request) => {
      resendOtpSchema.parse({ body: request.body });
    },
  }, AuthController.resendOtp);

  fastify.post('/forgot-password', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    },
    preHandler: async (request) => {
      forgotPasswordSchema.parse({ body: request.body });
    },
  }, AuthController.forgotPassword);

  fastify.post('/reset-password', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    },
    preHandler: async (request) => {
      resetPasswordSchema.parse({ body: request.body });
    },
  }, AuthController.resetPassword);

  fastify.put('/link-child', {
    preHandler: async (request) => {
      linkChildSchema.parse({ body: request.body });
    },
  }, AuthController.linkChild);

  fastify.put('/change-password', {
    preHandler: [
      authenticate,
      async (request) => {
        changePasswordSchema.parse({ body: request.body });
      },
    ],
  }, AuthController.changePassword);

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
