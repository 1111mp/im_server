import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map, of } from 'rxjs';
import { CacheApiInfo, CacheApiKey } from '../decotators/cache.decorator';
import { IORedisKey } from 'src/redis/redis.module';
import type { Redis } from 'ioredis';

@Injectable()
export class CacheApiInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheApiInterceptor.name);

  constructor(
    private reflector: Reflector,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Promise<Observable<unknown>> {
    const cacheInfo = this.reflector.getAllAndOverride<CacheApiInfo>(
      CacheApiKey,
      [context.getHandler(), context.getClass()],
    );

    if (!cacheInfo || !cacheInfo.enableCache) return next.handle();

    const { method, url } = context.switchToHttp().getRequest<Request>();

    method !== 'GET' && this.logger.warn('CacheApi only supports GET requests');

    const { expire, key = url } = cacheInfo;

    const data = await this.redisClient.get(key);
    if (data) {
      return of(data);
    } else {
      return next.handle().pipe(
        map(async (data) => {
          await this.redisClient.set(key, JSON.stringify(data), 'EX', expire);
          return data;
        }),
      );
    }
  }
}
