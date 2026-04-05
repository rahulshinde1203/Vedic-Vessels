import Redis from 'ioredis';

let redis: Redis | null = null;

function createRedis() {
  const client = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    connectTimeout: 3000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't retry — fail fast and disable cache
  });

  client.on('connect', () => console.log('Redis connected'));
  client.on('error', (err) => {
    console.warn('Redis unavailable, caching disabled:', err.message);
    redis = null;
  });

  return client;
}

try {
  redis = createRedis();
} catch {
  console.warn('Redis unavailable, caching disabled');
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const val = await redis.get(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redis) return;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // fail silently — cache miss is safe
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(...keys);
    } catch {
      // fail silently
    }
  },

  async delPattern(pattern: string): Promise<void> {
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(...keys);
    } catch {
      // fail silently
    }
  },
};
