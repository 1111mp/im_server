import {
  AllowNull,
  BelongsToMany,
  Column,
  Comment,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { RolePermission } from './role-permission.model';

@Table
export class Permission extends Model<Permission> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id;

  @Unique(true)
  @AllowNull(false)
  @Comment('permission name')
  @Column(DataType.STRING)
  name;

  @Comment('permission description')
  @Column(DataType.STRING)
  desc;

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}
