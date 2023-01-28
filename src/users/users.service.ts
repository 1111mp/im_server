import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly redisService: RedisService,
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

      await trans.commit();

      const role = await user.$get('role');
      const { id, name: roleName, desc: roleDesc } = role;

      return { ...user.toJSON(), roleId: id, roleName, roleDesc };
    } catch (err) {
      await trans.rollback();
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
      await this.redisService.getRedisClient().hDel(auth, token);

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
}
