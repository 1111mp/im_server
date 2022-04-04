import { BaseContext } from "koa";
import { verify } from "jsonwebtoken";
import * as unless from "koa-unless";
import { RedisType } from "../../redis";

type Context = BaseContext & {
  userId: number;
  headers: {
    token: string;
    userid: string;
  };
};

export function Auth(redis: RedisType) {
  const middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    const { token, userid: userId } = ctx.headers;

    if (!token || !userId) ctx.throw(401, "Authentication Error");

    const auth_key = `${process.env.USER_AUTH_KEY}::${userId}`;
    const real_token = await redis.instance.hget(auth_key, token);

    if (!real_token) {
      ctx.throw(401, "Authentication Error");
    } else {
      try {
        const decoded = verify(
          real_token,
          process.env.SECRET_Key!
        ) as UserAttributes;

        ctx.userId = decoded.id;
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          ctx.throw(401, `Authentication expired. expired at ${err.expiredAt}`);
        } else {
          ctx.throw(401, "Authentication malformed");
        }
      }
    }

    return next();
  };

  middleware.unless = unless;

  return middleware;
}
