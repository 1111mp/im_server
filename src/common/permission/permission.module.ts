import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';
import { RolePermission } from './models/role-permission.model';

@Module({
  imports: [SequelizeModule.forFeature([Role, Permission, RolePermission])],
  providers: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
