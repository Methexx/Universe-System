import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectRedis, disconnectRedis } from './config/redis';

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectRedis();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

const shutdown = async () => {
  await disconnectRedis();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
 
