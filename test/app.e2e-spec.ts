// https://github.com/jmcdo29/testing-nestjs

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { IORedisKey } from 'src/common/redis/redis.module';

import type { Redis } from 'ioredis';

console.log = jest.fn();

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let redisClient: Redis;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.dev', '.env'],
        }),
        AppModule,
      ],
      providers: [{ provide: IORedisKey, useValue: {} }],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: false,
      defaultVersion: 'v1',
    });

    redisClient = app.get<Redis>(IORedisKey);

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await app.close();
  });
});
