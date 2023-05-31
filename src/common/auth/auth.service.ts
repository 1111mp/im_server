import {
  Injectable,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from 'src/api/users/users.service';
import { IORedisKey } from 'src/common/redis/redis.module';

import type { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {}

  async validateUser(
    account: string,
    pwd: string,
  ): Promise<Omit<User.UserInfo, 'pwd'>> {
    const user = await this.usersService.findByAccount(account);
    if (!user) throw new NotFoundException();

    if (user && compareSync(pwd, user.pwd)) {
      const { pwd, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User.UserAttributes, 'pwd'>) {
    const token = await this.cacheToken(user);

    return {
      statusCode: HttpStatus.OK,
      data: { ...user, token },
    };
  }

  async create(user: Omit<User.UserAttributes, 'pwd'>) {
    const token = await this.cacheToken(user);

    return token;
  }

  async delToken(userid: string, token: string) {
    const auth = `${process.env.USER_AUTH_KEY}::${userid}`;

    const res = await this.redisClient.hdel(auth, token);

    if (!res) {
      throw new InternalServerErrorException(
        'Error[Redis]: An unknown error occurred while delete the token cache',
      );
    }
  }

  verifyToken(token: string): User.UserInfo {
    return this.jwtService.verify(token);
  }

  getToken(userid: string, authorization: string) {
    const auth_key = `${process.env.USER_AUTH_KEY}::${userid}`;
    return this.redisClient.hget(auth_key, authorization);
  }

  private cacheToken(
    user: Omit<User.UserAttributes, 'pwd'>,
    maxAge: number = 60 * 60, // s. default 1 hour
  ): Promise<string> {
    const auth = `${process.env.USER_AUTH_KEY}::${user.id}`;
    const key = uuidv4();
    const token = this.jwtService.sign(user);

    return new Promise(async (reslove) => {
      const [setKey, expKey] = await this.redisClient
        .multi()
        .hset(auth, key, token)
        .expire(auth, maxAge)
        .exec();

      if (!!setKey && expKey) reslove(key);
      else
        throw new InternalServerErrorException(
          'Error[Redis]: An unknown error occurred while updating the token cache',
        );
    });
  }
}
