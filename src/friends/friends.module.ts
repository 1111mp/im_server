import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Friend } from './models/friend.model';
import { FriendSetting } from './models/friend-setting.model';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';

@Module({
  imports: [SequelizeModule.forFeature([Friend, FriendSetting])],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
