import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import {
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

export class AuthController {
  static async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.register(request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.status(409).send(errorResponse(error.message));
      }
      throw error;
    }
  }

  static async verifyOtp(request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.verifyOtp(request.body);
      return reply.send(successResponse('Verified and registered successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.login(request.body);
      return reply.send(successResponse('Login successful', result));
    } catch (error: any) {
      return reply.status(401).send(errorResponse(error.message));
    }
  }

  static async resendOtp(request: FastifyRequest<{ Body: ResendOtpInput }>, reply: FastifyReply) {
    try {
      const result = await AuthService.resendOtp(request.body);
      return reply.send(successResponse(result.message));
    } catch (error: any) {
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

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userClaims = (request as any).user;
      const result = await AuthService.refresh(userClaims);
      return reply.send(successResponse('Token refreshed', result));
    } catch (error: any) {
      return reply.status(401).send(errorResponse(error.message));
    }
  }

  static async logout(_request: FastifyRequest, reply: FastifyReply) {
    const result = await AuthService.logout();
    return reply.send(successResponse(result.message));
  }

  static async logoutAll(_request: FastifyRequest, reply: FastifyReply) {
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
