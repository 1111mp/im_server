import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/models/user.model';
import { jwtConstants } from '../constants';
import { RedisService } from 'src/redis/redis.service';

import type { Request } from 'express';

interface RequestForHeader extends Request {
  headers: {
    userid?: string;
    authorization?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: async (req: RequestForHeader) => {
        const { userid, authorization } = req.headers;

        if (!userid || !authorization) return null;

        const auth_key = `${process.env.USER_AUTH_KEY}::${userid}`;
        const token = await this.redisService
          .getRedisClient()
          .hGet(auth_key, authorization);

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: User) {
    // refresh token expiration time. (1 hour)
    const auth_key = `${process.env.USER_AUTH_KEY}::${payload.id}`;
    await this.redisService.getRedisClient().expire(auth_key, 60 * 60);

    return payload;
  }
}
