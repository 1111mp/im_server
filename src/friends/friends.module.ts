import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Friend } from './models/friend.model';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';

@Module({
  imports: [SequelizeModule.forFeature([Friend])],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
