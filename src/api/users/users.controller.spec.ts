import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/common/auth/auth.service';
import { HttpStatus } from '@nestjs/common';

const testUser = {
  id: 10007,
  account: '176******',
  avatar: 'avatar.png',
  email: 'test@gmail.com',
  regisTime: '2023-01-28 12:16:06',
  updateTime: '2023-01-29 14:01:35',
};

const token = '0dede6fc-299a-40ca-be9b-24d3d84f4307';

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

const { id: roleId, name: roleName, desc: roleDesc } = testRole;
const testInfo = {
  ...testUser,
  roleId,
  roleName,
  roleDesc,
  permissions: [testPermissions],
};

describe('UsersController', () => {
  let controller: UsersController,
    usersService: UsersService,
    authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createOne: jest.fn(() => testInfo),
            removeOne: jest.fn(),
            updateOne: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            create: jest.fn(() => token),
            delToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      await controller.login({ user: {} });
      expect(authService.login).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should make a new user', async () => {
      expect(authService.create({} as any)).toBe(token);

      const retVal = await controller.create({
        account: '176******',
        pwd: '********',
      });

      expect(usersService.createOne).toBeCalledWith({
        account: '176******',
        pwd: '********',
      });
      expect(retVal).toEqual({
        statusCode: HttpStatus.OK,
        data: { ...testInfo, token },
        message: 'successfully.',
      });
    });
  });

  describe('removeOne', () => {
    it('should remove the user', async () => {
      await controller.removeOne({
        headers: { userid: '10007', authorization: token },
      } as IMServerRequest.RequestForHeader);

      expect(usersService.removeOne).toBeCalledTimes(1);
      expect(usersService.removeOne).toBeCalledWith(10007, token);
    });
  });

  describe('updateOne', () => {
    it('should update the user', async () => {
      const retVal = await controller.updateOne({ userId: 10007 });

      expect(usersService.updateOne).toBeCalledTimes(1);
      expect(usersService.updateOne).toBeCalledWith({ userId: 10007 });
      expect(retVal.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('findOne', () => {
    it('should get the found user', async () => {
      const retVal = await controller.findOne('10007');

      expect(usersService.findOne).toBeCalledTimes(1);
      expect(usersService.findOne).toBeCalledWith('10007');
      expect(retVal.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const retVal = await controller.logout({
        headers: { userid: '10007', authorization: token },
      } as IMServerRequest.RequestForHeader);

      expect(authService.delToken).toBeCalledTimes(1);
      expect(authService.delToken).toBeCalledWith('10007', token);
      expect(retVal.statusCode).toBe(HttpStatus.OK);
    });
  });
});
