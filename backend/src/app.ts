import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import schoolRoutes from './modules/school/school.routes';
import gateRoutes from './modules/gate/gate.routes';
import { errorHandler } from './common/middleware/errorHandler';

const app = Fastify({
  logger: true
});

app.register(cors);
app.register(helmet);

// Error Handler
app.setErrorHandler(errorHandler);

// Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(usersRoutes, { prefix: '/api/users' });
app.register(schoolRoutes, { prefix: '/api/school' });
app.register(gateRoutes, { prefix: '/api/gate' });

app.get('/health', async () => {
  return { status: 'ok', message: 'Universe API is running' };
});

export default app;