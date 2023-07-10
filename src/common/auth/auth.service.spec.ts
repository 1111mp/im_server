import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/api/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IORedisKey } from 'src/common/redis/redis.module';

import type { Redis } from 'ioredis';

describe('AuthService', () => {
  let service: AuthService;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        { provide: IORedisKey, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    redisClient = module.get<Redis>(IORedisKey);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
