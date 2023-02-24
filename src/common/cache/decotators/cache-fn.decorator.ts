import { strictAssert } from 'src/utils/assert';

import type { Redis } from 'ioredis';

type Info = {
  target?: ModuleCache.CacheFnResult.Target;
  expire?: number;
  key?: string;
};

export const CacheFnResult = function (info?: Info) {
  return function (
    _target: Object,
    propertyKey: string,
    description: TypedPropertyDescriptor<
      (...args: unknown[]) => Promise<unknown>
    >,
  ) {
    // This part is executed at compile time

    const fn = description.value;

    // default create & key `${this.name}::${propertyKey}` & expire time 60s
    const {
      target = ModuleCache.CacheFnResult.Target.NormalCache,
      key = undefined,
      expire = undefined,
    } = info ? info : {};

    // Reduce runtime logic judgment
    // 不要放在 description.value 的 func 里 减少运行时的逻辑判断
    let exeFunc: (...args: unknown[]) => Promise<unknown>;
    switch (target) {
      case ModuleCache.CacheFnResult.Target.NormalCache: {
        exeFunc = async function () {
          // This part is executed at runtime

          strictAssert(
            !!this.redisClient,
            `[CacheFnResult] ${this.name}.redisClient is not defined`,
          );

          const redisKey = key ? key : `${this.name}::${propertyKey}`;
          const cache = await (this.redisClient as Redis).get(redisKey);

          if (cache) {
            return JSON.parse(cache);
          } else {
            const result = fn.apply(this, arguments);

            if (result === void 0) return result;

            expire
              ? await (this.redisClient as Redis).set(
                  redisKey,
                  JSON.stringify(result.toJson ? result.toJson() : result),
                  'EX',
                  expire,
                )
              : await (this.redisClient as Redis).set(
                  redisKey,
                  JSON.stringify(result.toJson ? result.toJson() : result),
                );
            return result;
          }
        };
        break;
      }
      case ModuleCache.CacheFnResult.Target.UpdateCache: {
        exeFunc = async function () {
          // This part is executed at runtime

          strictAssert(
            !!this.redisClient,
            `[CacheFnResult] ${this.name}.redisClient is not defined`,
          );

          const redisKey = key
            ? key
            : `${this.name}::${propertyKey.replace('update', 'get')}`;

          const result = fn.apply(this, arguments);

          if (result === void 0) return result;

          expire
            ? await (this.redisClient as Redis).set(
                redisKey,
                JSON.stringify(result.toJson ? result.toJson() : result),
                'EX',
                expire,
              )
            : await (this.redisClient as Redis).set(
                redisKey,
                JSON.stringify(result.toJson ? result.toJson() : result),
              );
          return result;
        };
        break;
      }
    }

    description.value = exeFunc;
  };
};
