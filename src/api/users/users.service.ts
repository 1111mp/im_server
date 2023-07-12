import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IORedisKey } from 'src/common/redis/redis.module';
import { User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

import type { Redis } from 'ioredis';
import { Role } from 'src/common/permission/models/role.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {}

  async findOne(id: string) {
    const user = await this.userModel.findOne({
      attributes: {
        exclude: ['pwd'],
      },
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException(`No user found with id ${id}`);

    return user.toJSON();
  }

  async findByAccount(account: string): Promise<User.UserInfo | null> {
    const trans = await this.sequelize.transaction();
    const user = await this.userModel.findOne({
      where: {
        account,
      },
      transaction: trans,
    });

    if (!user)
      if (!user)
        throw new NotFoundException(`No user found with account ${account}`);

    const role = await user.$get('role', { transaction: trans });
    const permissions = (
      await role.$get('permissions', { transaction: trans })
    ).map(({ id, name, desc }) => ({
      id,
      name,
      desc,
    }));

    await trans.commit();

    const { id: roleId, name: roleName, desc: roleDesc } = role;

    return {
      ...user.toJSON(),
      roleId,
      roleName,
      roleDesc,
      permissions,
    };
  }

  async createOne(createUserDto: CreateUserDto): Promise<User.UserInfo> {
    const trans = await this.sequelize.transaction();
    try {
      const user = await this.userModel.create(createUserDto, {
        transaction: trans,
      });
      const role = await user.$get('role');
      const permissions = (await role.$get('permissions')).map(
        ({ id, name, desc }) => ({
          id,
          name,
          desc,
        }),
      );

      await trans.commit();

      const { id: roleId, name: roleName, desc: roleDesc } = role;
      return { ...user.toJSON(), roleId, roleName, roleDesc, permissions };
    } catch (err) {
      await trans.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('The account already exists.');
      }
      throw new InternalServerErrorException('Database error.');
    }
  }

  async removeOne(id: number, token: string) {
    const user = await this.userModel.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException(`No user found with id ${id}`);

    const auth = `${process.env.USER_AUTH_KEY}::${id}`;
    await user.destroy();
    await this.redisClient.hdel(auth, token);
  }

  async updateOne(updateUserDto: UpdateUserDto) {
    const { userId, ...info } = updateUserDto;
    const user = await this.userModel.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`No user found with id ${userId}`);

    const newUser = await user.update(info);
    return newUser.toJSON();
  }
}
