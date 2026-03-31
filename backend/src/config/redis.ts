import { createClient, RedisClientType } from 'redis';
import { env } from './env';

let client: RedisClientType | null = null;

if (env.REDIS_URL) {
  client = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  client.on('error', (error) => {
    console.error('Redis error:', error);
  });
}

export const redis = client;

export const connectRedis = async () => {
  if (!redis) {
    console.log('Redis disabled: REDIS_URL not set. Running without cache.');
    return;
  }

  if (!redis.isOpen) {
    await redis.connect();
    console.log('Redis connected');
  }
};

export const disconnectRedis = async () => {
  if (!redis) return;

  if (redis.isOpen) {
    await redis.quit();
  }
};
