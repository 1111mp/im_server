import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { Member } from './models/member.model';
import { UsersModule } from '../users/users.module';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  imports: [SequelizeModule.forFeature([Group, Member]), UsersModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
