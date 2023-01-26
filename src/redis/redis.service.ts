import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { RedisStore } from 'cache-manager-redis-yet';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache<RedisStore>,
  ) {}

  getRedisClient() {
    return this.cacheManager.store.client;
  }
}
