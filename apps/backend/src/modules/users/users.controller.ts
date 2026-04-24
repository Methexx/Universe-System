import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service';
import { successResponse, errorResponse } from '../../common/utils/response';
import { PromoteUserInput, ParamsIdInput, UpdateProfileInput } from './users.schema';

export class UsersController {
  
  static async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userPayload = (request as any).user;
      const profile = await UsersService.getProfile(userPayload.userId);
      return reply.send(successResponse('Profile fetched', profile));
    } catch (error: any) {
      return reply.status(404).send(errorResponse(error.message));
    }
  }

  static async updateMe(request: FastifyRequest<{ Body: UpdateProfileInput }>, reply: FastifyReply) {
    try {
      const userPayload = (request as any).user;
      const updated = await UsersService.updateProfile(userPayload.userId, request.body);
      return reply.send(successResponse('Profile updated', updated));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async deleteMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userPayload = (request as any).user;
      await UsersService.deleteUser(userPayload.userId, userPayload.userId);
      return reply.send(successResponse('Account deleted successfully'));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getPending(request: FastifyRequest, reply: FastifyReply) {
    try {
      const pendingUsers = await UsersService.getPendingUsers();
      return reply.send(successResponse('Pending users fetched', pendingUsers));
    } catch (error: any) {
      return reply.status(500).send(errorResponse(error.message));
    }
  }

  static async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const allUsers = await UsersService.getAllUsers();
      return reply.send(successResponse('All users fetched', allUsers));
    } catch (error: any) {
      return reply.status(500).send(errorResponse(error.message));
    }
  }

  static async promote(request: FastifyRequest<{ Params: ParamsIdInput, Body: PromoteUserInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const { role } = request.body;
      const updatedUser = await UsersService.promoteUser(id, role);
      return reply.send(successResponse(`User promoted conditionally to ${role}`, updatedUser));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async suspend(request: FastifyRequest<{ Params: ParamsIdInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const suspended = await UsersService.suspendUser(id);
      return reply.send(successResponse('User suspended', suspended));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async unsuspend(request: FastifyRequest<{ Params: ParamsIdInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const unsuspended = await UsersService.unsuspendUser(id);
      return reply.send(successResponse('User unsuspended', unsuspended));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async delete(request: FastifyRequest<{ Params: ParamsIdInput }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const deleted = await UsersService.deleteUser(id);
      return reply.send(successResponse('User deleted', deleted));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }
}
