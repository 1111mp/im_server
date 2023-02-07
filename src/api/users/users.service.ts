import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IORedisKey } from 'src/common/redis/redis.module';
import { User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

import type { Redis } from 'ioredis';

@Injectable()
export class UsersService {
  constructor(
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

  async findByAccount(account: string): Promise<User.UserInfo | null> {
    const user = await this.userModel.findOne({
      where: {
        account,
      },
    });

    if (!user) return null;

    const role = await user.$get('role');
    const permissions = (await role.$get('permissions')).map(
      ({ id, name, desc }) => ({
        id,
        name,
        desc,
      }),
    );
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
    const trans = await this.userModel.sequelize.transaction();
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
      console.log(err);
      throw err;
    }
  }

  async deleteOne(
    id: string,
    token: string,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const t = await this.userModel.sequelize.transaction();

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
    } else if (count === 0) {
      await t.rollback();
      throw new NotFoundException('No resources deleted.');
    } else {
      await t.rollback();
      throw new InternalServerErrorException('Something error.');
    }
  }

  async updateOne(
    updateUserDto: UpdateUserDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { userId, ...info } = updateUserDto;
    const [count] = await this.userModel.update(info, {
      where: { id: userId },
    });

    if (count === 1) {
      return { statusCode: HttpStatus.OK, message: 'Update successed.' };
    } else if (count === 0) {
      throw new NotFoundException('No resources are updated.');
    } else {
      throw new InternalServerErrorException('Database error.');
    }
  }
}
