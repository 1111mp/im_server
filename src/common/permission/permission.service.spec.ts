import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { PermissionService } from './permission.service';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';
import { transactionHelper } from 'src/utils/helper';
import { Sequelize } from 'sequelize-typescript';

describe('PermissionService', () => {
  let service: PermissionService,
    permissionModel: typeof Permission,
    sequelize: Sequelize;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: Sequelize,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: getModelToken(Role),
          useValue: {
            create: jest.fn(() => ({ $set: jest.fn() })),
          },
        },
        {
          provide: getModelToken(Permission),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionModel = module.get<typeof Permission>(getModelToken(Permission));
    sequelize = module.get<Sequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a permission', () => {
      expect(service.createOne({ name: 'admin', desc: 'admin' }));
      expect(permissionModel.create).toBeCalledTimes(1);
      expect(permissionModel.create).toBeCalledWith({
        name: 'admin',
        desc: 'admin',
      });
    });
  });

  describe('createRole', () => {
    it('should create a role successed', async () => {
      const { transaction, commit } = transactionHelper(sequelize);

      await service.createRole({
        name: 'admin',
        desc: 'admin',
        permissions: [],
      });

      expect(transaction).toBeCalledTimes(1);
      expect(commit).toBeCalledTimes(1);
    });
  });
});
