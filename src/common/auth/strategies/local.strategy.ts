import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'account',
      passwordField: 'pwd',
    });
  }

  async validate(
    account: string,
    pwd: string,
  ): Promise<Omit<User.UserAttributes, 'pwd'>> {
    const user = await this.authService.validateUser(account, pwd);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
