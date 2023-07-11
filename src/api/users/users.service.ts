import {
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

    if (!user) return user;

    const {
      id: roleId,
      name: roleName,
      desc: roleDesc,
    } = await user.$get('role');

    return {
      ...user.toJSON(),
      roleId,
      roleName,
      roleDesc,
    };
  }

  async getUserModel(id: number): Promise<User> {
    return this.userModel.findOne({
      attributes: { exclude: ['pwd'] },
      where: { id },
    });
  }

  async findByAccount(account: string): Promise<User.UserInfo | null> {
    const trans = await this.sequelize.transaction();
    const user = await this.userModel.findOne({
      where: {
        account,
      },
      transaction: trans,
    });

    if (!user) return null;

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

  async createOne(createUserDto: CreateUserDto) {
    let { roleId = 5, ...userCreate } = createUserDto;
    const trans = await this.sequelize.transaction();
    try {
      const user = await this.userModel.create(userCreate, {
        transaction: trans,
      });
      await user.$set('role', roleId, {
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

      const { id, name: roleName, desc: roleDesc } = role;

      return { ...user.toJSON(), roleId: id, roleName, roleDesc, permissions };
    } catch (err) {
      await trans.rollback();
      throw new InternalServerErrorException('Database error.');
    }
  }

  async removeOne(
    id: string,
    token: string,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const t = await this.sequelize.transaction();

    const count = await this.userModel.destroy({
      where: { id },
      transaction: t,
    });

    if (count === 1) {
      const auth = `${process.env.USER_AUTH_KEY}::${id}`;
      await this.redisClient.hdel(auth, token);

      await t.commit();
      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      };
    }

    if (count === 0) {
      await t.rollback();
      throw new NotFoundException('No resources deleted.');
    }

    await t.rollback();
    throw new InternalServerErrorException('Something error.');
  }

  async updateOne(updateUserDto: UpdateUserDto) {
    const { userId, ...info } = updateUserDto;
    const user = await this.userModel.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`No user found with id ${userId}`);
    return user.update(info);
  }
}
