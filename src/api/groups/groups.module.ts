import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { Member } from './models/member.model';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  imports: [SequelizeModule.forFeature([Group, Member])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
