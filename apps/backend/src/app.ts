import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import schoolRoutes from './modules/school/school.routes';
import gateRoutes from './modules/gate/gate.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import announcementRoutes from './modules/announcements/announcements.routes';
import messageRoutes from './modules/messages/messages.routes';
import complaintsRoutes from './modules/complaints/complaints.routes';
import { errorHandler } from './common/middleware/errorHandler';
import { env } from './config/env';

const app = Fastify({
  logger: true
});

app.register(cookie);
app.register(cors, {
  origin: [env.WEB_URL, env.FLUTTER_ORIGIN, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
app.register(helmet);
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Error Handler
app.setErrorHandler(errorHandler);

// Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(usersRoutes, { prefix: '/api/users' });
app.register(schoolRoutes, { prefix: '/api/school' });
app.register(gateRoutes, { prefix: '/api/gate' });
app.register(attendanceRoutes, { prefix: '/api/attendance' });
app.register(announcementRoutes, { prefix: '/api/announcements' });
app.register(messageRoutes, { prefix: '/api/messages' });
app.register(complaintsRoutes, { prefix: '/api/complaints' });

app.get('/health', async () => {
  return { status: 'ok', message: 'Universe API is running' };
});

export default app;