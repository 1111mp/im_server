import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
    @InjectModel(Permission)
    private readonly permModel: typeof Permission,
  ) {}

  async createPerm(createPermDto: CreatePermDto) {
    try {
      const perm = await this.permModel.create(createPermDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Successed.',
        data: perm,
      };
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('The permission already exists.');
      } else {
        throw new InternalServerErrorException(`${err.name}: ${err.message}`);
      }
    }
  }

  async createRole(createRoleDto: CreateRoleDto) {
    // const role = await this.roleModel.findOne({ where: { id: 5 } });
    // await role.$add('permissions', [Permission.build({ id: 1 })], {transaction:t});
    const { permissions } = createRoleDto;
    const trans = await this.roleModel.sequelize.transaction();
    try {
      const role = await this.roleModel.create(createRoleDto, {
        transaction: trans,
      });
      await role.$set(
        'permissions',
        permissions.map((perm) => Permission.build({ id: perm })),
        {
          transaction: trans,
        },
      );

      await trans.commit();

      return {
        statusCode: HttpStatus.OK,
        message: 'Successed.',
        data: role,
      };
    } catch (err) {
      await trans.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('The role already exists.');
      } else {
        throw new InternalServerErrorException(`${err.name}: ${err.message}`);
      }
    }
  }
}
