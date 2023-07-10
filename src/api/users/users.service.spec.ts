import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { User as UserModel } from './models/user.model';
import { IORedisKey } from 'src/common/redis/redis.module';

import type { Redis } from 'ioredis';

describe('UsersService', () => {
  let service: UsersService;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(UserModel), useValue: {} },
        { provide: IORedisKey, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    redisClient = module.get<Redis>(IORedisKey);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
