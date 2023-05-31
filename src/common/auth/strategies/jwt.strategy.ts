import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { User } from '../../../api/users/models/user.model';
import { IORedisKey } from 'src/common/redis/redis.module';
import { ConfigService } from '@nestjs/config';

import type { Redis } from 'ioredis';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    super({
      jwtFromRequest: async (req: IMServerRequest.RequestForHeader) => {
        const { userid, authorization } = req.headers;

        if (!userid || !authorization) return null;

        const auth_key = `${process.env.USER_AUTH_KEY}::${userid}`;
        const token = await redisClient.hget(auth_key, authorization);

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY'),
    });
  }

  async validate(payload: User) {
    // refresh token expiration time. (1 hour)
    const auth_key = `${process.env.USER_AUTH_KEY}::${payload.id}`;
    await this.redisClient.expire(auth_key, 60 * 60 * 12);

    return payload;
  }
}
