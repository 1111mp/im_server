import { strictAssert } from 'src/utils/assert';

import type { Redis } from 'ioredis';

type Info = {
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
    const fn = description.value;

    description.value = async function () {
      strictAssert(
        !!this.redisClient,
        `[CacheFnResult] ${this.name}.redisClient is not defined`,
      );

      info = info ? info : { expire: 60 };
      const { key, expire } = info;
      const redisKey = key ? key : `${this.name}::${propertyKey}`;
      const cache = await (this.redisClient as Redis).get(redisKey);

      if (cache) {
        return JSON.parse(cache);
      } else {
        const result = fn.apply(this, arguments);
        result !== void 0 &&
          (await this.redisClient.set(
            key,
            JSON.stringify(result),
            'EX',
            expire,
          ));
        return result;
      }
    };
  };
};
