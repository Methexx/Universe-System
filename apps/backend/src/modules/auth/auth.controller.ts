import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LinkChildInput,
  LoginInput,
  RegisterInput,
  ResendOtpInput,
  ResetPasswordInput,
  UpdateFcmTokenInput,
  VerifyOtpInput,
} from './auth.schema';
import { successResponse, errorResponse } from '../../common/utils/response';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export class AuthController {
  static async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.register(request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.status(409).send(errorResponse('EMAIL_EXISTS'));
      }
      if (error.message.startsWith('Please wait')) {
        return reply.status(429).send(errorResponse('RATE_LIMIT'));
      }
      throw error;
    }
  }

  static async verifyOtp(request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.verifyOtp(request.body);
      reply.setCookie('auth_token', result.token, COOKIE_OPTIONS);
      return reply.send(successResponse('Verified and registered successfully', {
        role: result.role,
        user: result.user,
      }));
    } catch (error: any) {
      if (error.message === 'Invalid OTP') {
        return reply.status(400).send(errorResponse('INVALID_OTP'));
      }
      if (error.message === 'OTP has expired') {
        return reply.status(400).send(errorResponse('OTP_EXPIRED'));
      }
      if (error.message.startsWith('Maximum OTP attempts')) {
        return reply.status(400).send(errorResponse('MAX_ATTEMPTS'));
      }
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.login(request.body);
      reply.setCookie('auth_token', result.token, COOKIE_OPTIONS);
      return reply.send(successResponse('Login successful', {
        role: result.role,
        user: result.user,
      }));
    } catch (error: any) {
      if (error.message === 'ACCOUNT_PENDING') {
        return reply.status(403).send(errorResponse('ACCOUNT_PENDING'));
      }
      if (error.message === 'Invalid credentials') {
        return reply.status(401).send(errorResponse('INVALID_CREDENTIALS'));
      }
      if (error.message === 'Account disabled or suspended') {
        return reply.status(403).send(errorResponse('ACCOUNT_DISABLED'));
      }
      return reply.status(401).send(errorResponse(error.message));
    }
  }

  static async me(request: FastifyRequest, reply: FastifyReply) {
    const userClaims = (request as any).user as { userId: string; role: string; email: string };
    const user = await import('../../config/prisma').then(({ prisma }) =>
      prisma.user.findUnique({
        where: { id: userClaims.userId },
        select: { id: true, email: true, role: true, full_name: true, phone_number: true, avatar_url: true, is_active: true, is_suspended: true },
      })
    );
    if (!user || !user.is_active || user.is_suspended) {
      return reply.status(401).send(errorResponse('Unauthorized'));
    }
    return reply.send(successResponse('OK', {
      user: { userId: user.id, email: user.email, role: user.role, full_name: user.full_name, phone_number: user.phone_number, avatar_url: user.avatar_url },
    }));
  }

  static async resendOtp(request: FastifyRequest<{ Body: ResendOtpInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.resendOtp(request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      if (error.message.startsWith('Please wait')) {
        return reply.status(429).send(errorResponse('RATE_LIMIT'));
      }
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async forgotPassword(request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.forgotPassword(request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async resetPassword(request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.resetPassword(request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async changePassword(request: FastifyRequest<{ Body: ChangePasswordInput }>, reply: FastifyReply) {
    try {
      const userClaims = (request as any).user as { userId: string };
      const result = await AuthService.changePassword(userClaims.userId, request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userClaims = (request as any).user;
      const result = await AuthService.refresh(userClaims);
      reply.setCookie('auth_token', result.token, COOKIE_OPTIONS);
      return reply.send(successResponse('Token refreshed', {
        role: result.role,
        user: result.user,
      }));
    } catch (error: any) {
      return reply.status(401).send(errorResponse(error.message));
    }
  }

  static async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('auth_token', { path: '/' });
    const result = await AuthService.logout();
    return reply.send(successResponse(result.message));
  }

  static async logoutAll(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('auth_token', { path: '/' });
    const result = await AuthService.logoutAll();
    return reply.send(successResponse(result.message));
  }

  static async linkChild(request: FastifyRequest<{ Body: LinkChildInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.linkChild(request.body);
      return reply.send(successResponse(result.message, result.student));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async updateFcmToken(request: FastifyRequest<{ Body: UpdateFcmTokenInput }>, reply: FastifyReply) {
    try {
      const userClaims = (request as any).user;
      const result = await AuthService.updateFcmToken(userClaims.userId, request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }
}
