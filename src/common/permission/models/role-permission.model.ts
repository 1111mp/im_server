import {
  ForeignKey,
  AllowNull,
  Column,
  Comment,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { Permission } from './permission.model';

@Table
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @AllowNull(false)
  @Comment('role id')
  @Column(DataType.INTEGER)
  roleId;

  @ForeignKey(() => Permission)
  @AllowNull(false)
  @Comment('permission id')
  @Column(DataType.INTEGER)
  permId;
}
