import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
    @InjectModel(Permission)
    private readonly permModel: typeof Permission,
  ) {}

  createOne(createPermDto: CreatePermDto) {
    return this.permModel.create(createPermDto);
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { permissions, ...roleDto } = createRoleDto;
    const transaction = await this.sequelize.transaction();
    try {
      const role = await this.roleModel.create(roleDto, {
        transaction,
      });
      await role.$set('permissions', permissions, {
        transaction,
      });

      await transaction.commit();

      return role;
    } catch (err) {
      await transaction.rollback();
      if (err.name === 'SequelizeUniqueConstraintError')
        throw new ConflictException('The role already exists.');
    }
  }
}
