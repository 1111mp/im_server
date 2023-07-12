import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UsersService } from './users.service';
import { User as UserModel } from './models/user.model';
import { IORedisKey } from 'src/common/redis/redis.module';
import { transactionHelper } from 'src/utils/helper';

import type { Redis } from 'ioredis';

const testUser = {
  id: 10007,
  account: '176******',
  avatar: 'avatar.png',
  email: 'test@gmail.com',
  regisTime: '2023-01-28 12:16:06',
  updateTime: '2023-01-29 14:01:35',
};

const testRole = {
  id: 5,
  name: 'admin',
  desc: '管理员',
};

const testPermissions = {
  id: 1,
  name: 'userDel',
  desc: 'Delete user',
};

function userHelper() {
  const permissionsStub = jest.fn(() => ({
      map: jest.fn(() => [testPermissions]),
    })),
    roleStub = jest.fn((key: string) => ({
      ...testRole,
      $get: permissionsStub,
    }));

  return { roleStub, permissionsStub };
}

describe('UsersService', () => {
  let service: UsersService,
    model: typeof UserModel,
    redisClient: Redis,
    sequelize: Sequelize;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: Sequelize,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: getModelToken(UserModel),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(() => testUser),
            destroy: jest.fn(),
          },
        },
        {
          provide: IORedisKey,
          useValue: {
            hdel: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<typeof UserModel>(getModelToken(UserModel));
    redisClient = module.get<Redis>(IORedisKey);
    sequelize = module.get<Sequelize>(Sequelize);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByAccount', () => {
    it('should return a found user info', async () => {
      const { transaction, commit } = transactionHelper(sequelize);
      const { roleStub } = userHelper();
      const findSpy = jest.spyOn(model, 'findOne').mockReturnValue({
        $get: roleStub,
        toJSON: jest.fn(() => testUser),
      } as any);

      const retVal = await service.findByAccount('176********');

      expect(transaction).toBeCalledTimes(1);
      expect(findSpy).toBeCalledWith({
        where: { account: '176********' },
        transaction: await transaction(),
      });
      expect(commit).toBeCalledTimes(1);

      const { id: roleId, name: roleName, desc: roleDesc } = testRole;

      expect(retVal).toEqual({
        ...testUser,
        roleId,
        roleName,
        roleDesc,
        permissions: [testPermissions],
      });
    });
  });

  describe('createOne', () => {
    it('should return a created user info', async () => {
      const { transaction, commit } = transactionHelper(sequelize);
      const { roleStub } = userHelper();
      const createSpy = jest.spyOn(model, 'create').mockImplementation(
        () =>
          ({
            toJSON: jest.fn(() => testUser),
            $get: roleStub,
          }) as any,
      );
      const retVal = await service.createOne({
        account: '176******',
        pwd: '********',
      });

      expect(transaction).toBeCalledTimes(1);
      expect(createSpy).toBeCalledWith(
        {
          account: '176******',
          pwd: '********',
        },
        { transaction: await transaction() },
      );
      expect(commit).toBeCalledTimes(1);

      const { id: roleId, name: roleName, desc: roleDesc } = testRole;

      expect(retVal).toEqual({
        ...testUser,
        roleId,
        roleName,
        roleDesc,
        permissions: [testPermissions],
      });
    });

    it('should throw an error when create', async () => {
      transactionHelper(sequelize);

      expect(
        service.createOne({
          account: '176******',
          pwd: '********',
        }),
      ).rejects.toThrowError(InternalServerErrorException);
      expect(
        service.createOne({
          account: '176******',
          pwd: '********',
        }),
      ).rejects.toThrowError('Database error.');
    });
  });

  describe('removeOne', () => {
    it('should remove a user', async () => {
      const destroyStub = jest.fn();
      const findSpy = jest.spyOn(model, 'findOne').mockReturnValue({
        destroy: destroyStub,
      } as any);

      const retVal = await service.removeOne(10007, '');
      expect(findSpy).toBeCalledWith({ where: { id: 10007 } });
      expect(retVal).toBeUndefined();
    });

    it('should throw an error', () => {
      expect(service.removeOne(10007, '')).rejects.toThrowError(
        NotFoundException,
      );
      expect(model.findOne).toBeCalledWith({ where: { id: 10007 } });
    });
  });

  describe('updateOne', () => {
    it('should update a cat', async () => {
      const updateStub = jest.fn().mockReturnValue({ toJSON: jest.fn() });
      const findSpy = jest.spyOn(model, 'findOne').mockReturnValue({
        update: updateStub,
      } as any);

      expect(service.updateOne({ userId: 10007 }));
      expect(findSpy).toBeCalledWith({ where: { id: 10007 } });
    });
  });
});
