import RedisStoreInstance from "./redis";

export default function () {
  return async (ctx, next) => {
    ctx.redis = RedisStoreInstance;
    await next();
  };
}
