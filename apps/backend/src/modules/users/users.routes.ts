import { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller';
import { authenticate } from '../../common/middleware/authenticate';
import { authorize } from '../../common/middleware/rbac';
import { updateProfileSchema, promoteUserSchema, paramsIdSchema } from './users.schema';

export default async function usersRoutes(fastify: FastifyInstance) {
  
  // Apply authenticate middleware to all routes in this plugin
  fastify.addHook('preHandler', authenticate);

  // 1. GENERAL ALL-ROLE ROUTES
  fastify.get('/me', UsersController.getMe);

  fastify.put('/me', {
    preHandler: async (request) => { updateProfileSchema.parse({ body: request.body }) }
  }, UsersController.updateMe);

  fastify.delete('/me', UsersController.deleteMe);

  fastify.put('/fcm-token', UsersController.updateFcmToken);
  fastify.get('/settings', UsersController.getSettings);
  fastify.patch('/settings', UsersController.updateSettings);

  // 2. ADMIN-ONLY ROUTES
  // We use the `authorize` RBAC middleware in the preHandler array
  fastify.get('/pending', {
    preHandler: [authorize(['admin'])]
  }, UsersController.getPending);

  fastify.get('/all', {
    preHandler: [authorize(['admin'])]
  }, UsersController.getAll);

  fastify.put('/:id/promote', {
    preHandler: [
      authorize(['admin']),
      async (request) => { promoteUserSchema.parse({ body: request.body, params: request.params }) }
    ]
  }, UsersController.promote);

  fastify.put('/:id/suspend', {
    preHandler: [
      authorize(['admin']),
      async (request) => { paramsIdSchema.parse({ params: request.params }) }
    ]
  }, UsersController.suspend);

  fastify.put('/:id/unsuspend', {
    preHandler: [
      authorize(['admin']),
      async (request) => { paramsIdSchema.parse({ params: request.params }) }
    ]
  }, UsersController.unsuspend);

  fastify.delete('/:id', {
    preHandler: [
      authorize(['admin']),
      async (request) => { paramsIdSchema.parse({ params: request.params }) }
    ]
  }, UsersController.delete);

  fastify.get('/teachers', {
    preHandler: [authorize(['admin'])]
  }, UsersController.getTeachers);
}
