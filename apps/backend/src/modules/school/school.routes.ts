import { FastifyInstance } from 'fastify';
import { SchoolController } from './school.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';
import { 
  createGradeSchema,
  createClassSchema,
  createStudentSchema,
  updateStudentSchema,
  UpdateStudentInput
} from './school.schema';

export default async function schoolRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // ==========================
  // GRADES (/api/school/grades)
  // ==========================
  fastify.post('/grades', {
    preHandler: [authorize(['admin']), async (request) => { createGradeSchema.parse({ body: request.body }) }]
  }, SchoolController.createGrade);

  fastify.get('/grades', {
    preHandler: [authorize(['admin', 'teacher'])]
  }, SchoolController.getGrades);

  // ==========================
  // CLASSES (/api/school/classes)
  // ==========================
  fastify.post('/classes', {
    preHandler: [authorize(['admin']), async (request) => { createClassSchema.parse({ body: request.body }) }]
  }, SchoolController.createClass);

  fastify.get('/classes', {
    preHandler: [authorize(['admin'])]
  }, SchoolController.getClasses);

  fastify.get('/grades-with-classes', {
    preHandler: [authorize(['admin'])]
  }, SchoolController.getGradesWithClasses);

  fastify.get('/classes/mine', {
    preHandler: [authorize(['teacher'])]
  }, SchoolController.getMyClasses);

  fastify.get<{ Params: { id: string } }>('/classes/:id/students', {
    preHandler: [authorize(['admin', 'teacher'])]
  }, SchoolController.getClassStudents);

  // ==========================
  // STUDENTS (/api/school/students)
  // ==========================
  fastify.get('/students/next-id', {
    preHandler: [authorize(['admin'])]
  }, SchoolController.getNextStudentId);

  fastify.post('/students/photo', {
    preHandler: [authorize(['admin'])]
  }, SchoolController.uploadStudentPhoto);

  fastify.post('/students', {
    preHandler: [authorize(['admin']), async (request) => { createStudentSchema.parse({ body: request.body }) }]
  }, SchoolController.createStudent);

  fastify.get('/students', {
    preHandler: [authorize(['admin', 'teacher'])]
  }, SchoolController.getStudents);

  fastify.patch<{ Params: { id: string }, Body: UpdateStudentInput }>('/students/:id', {
    preHandler: [authorize(['admin']), async (request) => { updateStudentSchema.parse({ body: request.body, params: request.params }) }]
  }, SchoolController.updateStudent);

  fastify.delete<{ Params: { id: string } }>('/students/:id', {
    preHandler: [authorize(['admin'])]
  }, SchoolController.deleteStudent);

  fastify.get('/overview/stats', {
    preHandler: [authorize(['admin'])]
  }, SchoolController.getOverviewStats);
}