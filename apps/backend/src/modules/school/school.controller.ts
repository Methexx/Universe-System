import { FastifyRequest, FastifyReply } from 'fastify';
import { SchoolService } from './school.service';
import { CreateGradeInput, CreateClassInput, CreateStudentInput, UpdateStudentInput, UpdateClassInput } from './school.schema';
import { successResponse, errorResponse } from '../../common/utils/response';
import { delCacheByPattern, getOrSetCache } from '../../common/utils/cache';

export class SchoolController {
  
  // --- GRADES ---
  static async createGrade(request: FastifyRequest<{ Body: CreateGradeInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.createGrade(request.body);
      await delCacheByPattern('school:*');
      return reply.status(201).send(successResponse('Grade created successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getGrades(request: FastifyRequest, reply: FastifyReply) {
    const results = await getOrSetCache('school:grades', () => SchoolService.getGrades());
    return reply.send(successResponse('Grades fetched successfully', results));
  }

  // --- CLASSES ---
  static async createClass(request: FastifyRequest<{ Body: CreateClassInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.createClass(request.body);
      await delCacheByPattern('school:*');
      return reply.status(201).send(successResponse('Class created successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getClasses(request: FastifyRequest, reply: FastifyReply) {
    const results = await getOrSetCache('school:classes', () => SchoolService.getClasses());
    return reply.send(successResponse('Classes fetched', results));
  }

  static async getGradesWithClasses(request: FastifyRequest, reply: FastifyReply) {
    const results = await getOrSetCache('school:grades-with-classes', () => SchoolService.getGradesWithClasses());
    return reply.send(successResponse('Grades with classes fetched', results));
  }

  static async getMyClasses(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;
    const cacheKey = `school:my-classes:${user.userId}`;
    const results = await getOrSetCache(cacheKey, () => SchoolService.getMyClasses(user.userId));
    return reply.send(successResponse('My classes fetched', results));
  }

  static async getClassStudents(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const cacheKey = `school:class-students:${request.params.id}`;
    const results = await getOrSetCache(cacheKey, () => SchoolService.getClassStudents(request.params.id));
    return reply.send(successResponse('Class students fetched', results));
  }

  static async deleteGrade(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await SchoolService.deleteGrade(request.params.id);
      await delCacheByPattern('school:*');
      return reply.send(successResponse('Grade deleted successfully'));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async deleteClass(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await SchoolService.deleteClass(request.params.id);
      await delCacheByPattern('school:*');
      return reply.send(successResponse('Class deleted successfully'));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async updateClass(request: FastifyRequest<{ Params: { id: string }; Body: UpdateClassInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.updateClass(request.params.id, request.body);
      await delCacheByPattern('school:*');
      return reply.send(successResponse('Class updated successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  // --- STUDENTS ---
  static async createStudent(request: FastifyRequest<{ Body: CreateStudentInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.createStudent(request.body);
      await delCacheByPattern('school:*');
      return reply.status(201).send(successResponse('Student created successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getStudents(request: FastifyRequest, reply: FastifyReply) {
    const results = await getOrSetCache('school:students', () => SchoolService.getStudents());
    return reply.send(successResponse('Students fetched', results));
  }

  static async getNextStudentId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const next_id = await SchoolService.getNextStudentId();
      return reply.send(successResponse('Next student ID fetched', { next_id }));
    } catch (error: any) {
      return reply.status(500).send(errorResponse(error.message));
    }
  }

  static async uploadStudentPhoto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      if (!data) return reply.status(400).send(errorResponse('No file uploaded'));
      const buffer = await data.toBuffer();
      const photo_url = await SchoolService.uploadStudentPhoto(buffer, data.mimetype, data.filename);
      return reply.send(successResponse('Photo uploaded', { photo_url }));
    } catch (error: any) {
      return reply.status(500).send(errorResponse(error.message));
    }
  }
  static async updateStudent(request: FastifyRequest<{ Params: { id: string }, Body: UpdateStudentInput }>, reply: FastifyReply) {
    try {
      const result = await SchoolService.updateStudent(request.params.id, request.body);
      await delCacheByPattern('school:*');
      return reply.send(successResponse('Student updated successfully', result));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async deleteStudent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await SchoolService.deleteStudent(request.params.id);
      await delCacheByPattern('school:*');
      return reply.send(successResponse('Student deleted successfully'));
    } catch (error: any) {
      return reply.status(400).send(errorResponse(error.message));
    }
  }

  static async getOverviewStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const results = await getOrSetCache('school:overview-stats', () => SchoolService.getOverviewStats(), 300); // 5 min cache
      return reply.send(successResponse('Overview stats fetched', results));
    } catch (error: any) {
      return reply.status(500).send(errorResponse(error.message));
    }
  }
}