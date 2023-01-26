import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisService } from './redis.service';

import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PWD, REDIS_DB } =
          process.env;
        return {
          store: await redisStore({
            url: `redis://:@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`,
          }),
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
