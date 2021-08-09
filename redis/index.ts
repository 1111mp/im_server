import Redis, { RedisOptions } from "ioredis";
import * as Redlock from "redlock";

export type RedisType = {
  instance: Redis.Redis;
  redlock: Redlock;
};

Redis.Command.setReplyTransformer("lrange", (result: string[]) => {
  return result.map((item) => {
    try {
      return JSON.parse(item);
    } catch (error) {
      return item;
    }
  });
});

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PWD,
  db: Number(process.env.REDIS_DB),
  // keyPrefix: ''
};

const instance = new Redis(redisConfig);
const redlock = new Redlock([instance], {
  retryDelay: 200,
  retryCount: 5,
});

export const redis: RedisType = {
  instance,
  redlock,
};