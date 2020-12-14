import * as jwt from "jsonwebtoken";
import * as unless from "koa-unless";
import Config from "../../../config";

/**
 * 返回前端的token为存在redis中真正token的key
 */
export default function (): any {
  const auth: any = async (ctx, next) => {
    const { token } = ctx.headers;
    if (!token) ctx.throw(401, "Authentication Error");

    // 获取redis中的token
    const realToken = await ctx.redis.get(token);

    if (!realToken) {
      ctx.throw(401, "Authentication Error");
    } else {
      // 校验token
      try {
        let decoded = jwt.verify(realToken, Config.secretOrPrivateKey);

        ctx.userId = decoded.userId;
        // 校验成功之后 自动延长token的缓存时间
        ctx.redis.set(token, realToken, Config.tokenExp);
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

  auth["unless"] = unless;

  return auth;
}
