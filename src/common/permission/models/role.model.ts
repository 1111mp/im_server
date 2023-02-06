import {
  Model,
  Table,
  Column,
  Unique,
  AllowNull,
  Comment,
  DataType,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { Permission } from './permission.model';
import { RolePermission } from './role-permission.model';
import { User } from 'src/api/users/models/user.model';

import * as dayjs from 'dayjs';

@Table
export class Role extends Model<Role> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id;

  @Unique(true)
  @AllowNull(false)
  @Comment('role name')
  @Column(DataType.STRING)
  name;

  @Comment('role description')
  @Column(DataType.STRING)
  desc;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm');
    },
  })
  createdAt;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm');
    },
  })
  updatedAt;

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];

  @HasMany(() => User)
  users: User[];
}
