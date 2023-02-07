import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { hashSync } from 'bcrypt';
import * as dayjs from 'dayjs';
import { Role } from 'src/common/permission/models/role.model';
import { Friend } from 'src/api/friends/models/friend.model';
import { Group } from 'src/api/groups/models/group.model';
import { Member } from 'src/api/groups/models/member.model';

@Table({
  initialAutoIncrement: '10000',
  createdAt: 'regisTime',
  updatedAt: 'updateTime',
})
export class User extends Model<User> {
  @ApiProperty({ type: 'number', example: 10001, description: 'userid' })
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id;

  @ApiProperty({ example: '176xxxxxxxx', description: '账号 手机号' })
  @Column({
    type: DataType.STRING(11),
    validate: {
      is: /^1[3-9](\d{9})$/i,
    },
    unique: 'account',
    comment: '账号 手机号',
  })
  account;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    set(val: string) {
      // hash pwd
      const hash = hashSync(val, 10);
      this.setDataValue('pwd', hash);
    },
    comment: '用户密码',
  })
  pwd;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.STRING, allowNull: true, comment: '用户头像' })
  avatar;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: 'email',
    validate: {
      isEmail: true,
    },
    comment: '用户邮箱',
  })
  email;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('regisTime')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  regisTime;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updateTime')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updateTime;

  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId;

  @BelongsTo(() => Role)
  role: Role;

  @BelongsToMany(() => Group, () => Member)
  groups: Group[];
}
