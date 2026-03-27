import { FastifyRequest, FastifyReply } from 'fastify';
import { SchoolService } from './school.service';
import { CreateGradeInput, CreateClassInput, CreateStudentInput } from './school.schema';
import { successResponse, errorResponse } from '../../common/utils/response';

export class SchoolController {
  
  // --- GRADES ---
  static async createGrade(request: FastifyRequest<{ Body: CreateGradeInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.createGrade(request.body);
      return reply.status(201).send(successResponse('Grade created successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getGrades(request: FastifyRequest, reply: FastifyReply) {
    const results = await SchoolService.getGrades();
    return reply.send(successResponse('Grades fetched successfully', results));
  }

  // --- CLASSES ---
  static async createClass(request: FastifyRequest<{ Body: CreateClassInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.createClass(request.body);
      return reply.status(201).send(successResponse('Class created successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getClasses(request: FastifyRequest, reply: FastifyReply) {
    const results = await SchoolService.getClasses();
    return reply.send(successResponse('Classes fetched', results));
  }

  static async getMyClasses(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const results = await SchoolService.getMyClasses(user.userId);
    return reply.send(successResponse('My classes fetched', results));
  }

  static async getClassStudents(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const results = await SchoolService.getClassStudents(request.params.id);
    return reply.send(successResponse('Class students fetched', results));
  }

  // --- STUDENTS ---
  static async createStudent(request: FastifyRequest<{ Body: CreateStudentInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.createStudent(request.body);
      return reply.status(201).send(successResponse('Student created successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getStudents(request: FastifyRequest, reply: FastifyReply) {
    const results = await SchoolService.getStudents();
    return reply.send(successResponse('Students fetched', results));
  }
}