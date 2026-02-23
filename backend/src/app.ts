import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const app = Fastify({
  logger: true
});

app.register(cors);
app.register(helmet);

app.get('/health', async () => {
  return { status: 'ok', message: 'Universe API is running' };
});

export default app;