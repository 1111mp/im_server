import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(
    account: string,
    pwd: string,
  ): Promise<Omit<User.UserAttributes, 'pwd'>> {
    let user = await this.usersService.findByAccount(account);
    if (!user) throw new NotFoundException();

    user = user.toJSON();
    if (user && compareSync(pwd, user.pwd)) {
      const { pwd, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User.UserAttributes, 'pwd'>) {
    const token = await this.cacheToken(user);

    return {
      code: 200,
      token,
      data: user,
    };
  }

  private cacheToken(
    user: Omit<User.UserAttributes, 'pwd'>,
    maxAge: number = 60 * 60 * 1000, // default 1 hour
  ) {
    const auth = `${process.env.USER_AUTH_KEY}::${user.id}`;
    const key = uuidv4();
    const token = this.jwtService.sign(user);

    return new Promise(async (reslove) => {
      const [delKey, setKey, expKey] = await this.redisService
        .getRedisClient()
        .multi()
        .del(auth)
        .hSet(auth, key, token)
        .expire(auth, maxAge)
        .exec();

      if (!!delKey && !!setKey && expKey) reslove(key);
      else
        throw Error(
          'Error[Redis]: An unknown error occurred while updating the token cache',
        );
    });
  }
}
