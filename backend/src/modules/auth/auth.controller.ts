import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterInput, VerifyOtpInput, LoginInput } from './auth.schema';
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
}
