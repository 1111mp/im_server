import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      attributes: {
        exclude: ['pwd'],
      },
      where: {
        id,
      },
    });
  }

  findByAccount(account: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        account,
      },
    });
  }
}
