import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import * as jwt from "jsonwebtoken";
import { USERAUTHKEY } from "../const";
import Config from "../../config";

export function setToken(
  redis: Redis.Redis,
  user: any,
  maxAge: number = 60 * 60 * 1000
): Promise<string | "failed"> {
  const auth = `${USERAUTHKEY}::${user.userId}`;
  const key = uuidv4();
  const token = jwt.sign(user, Config.secretOrPrivateKey);

  return new Promise((reslove) => {
    redis
      .multi()
      .del(auth)
      .hset(auth, key, token)
      .expire(auth, maxAge)
      .exec((err, results) => {
        if (err) {
          // error
          reslove("failed");
        }
        reslove(key);
      });
  });
}

export async function getToken(redis: Redis.Redis, userId, key) {
  const auth = `${USERAUTHKEY}::${userId}`;
  return redis.hget(auth, key);
}

export function extendToken(
  redis: Redis.Redis,
  userId,
  maxAge: number = 60 * 60 * 1000
) {
  const auth = `${USERAUTHKEY}::${userId}`;
  redis.expire(auth, maxAge);
}

export function delToken(redis: Redis.Redis, userId, key) {
  const auth = `${USERAUTHKEY}::${userId}`;
  redis.hdel(auth, key);
}
