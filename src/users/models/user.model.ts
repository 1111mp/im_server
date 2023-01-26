import { DataTypes } from 'sequelize';
import { Model, Table, Column } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { hashSync } from 'bcrypt';
import * as dayjs from 'dayjs';

@Table({
  initialAutoIncrement: '10000',
  createdAt: 'regisTime',
  updatedAt: 'updateTime',
})
export class User extends Model<User> {
  @ApiProperty({ type: 'number', example: 10001, description: 'userid' })
  @Column({ primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER })
  id;

  @ApiProperty({ example: '176xxxxxxxx', description: '账号 手机号' })
  @Column({
    type: DataTypes.STRING(11),
    validate: {
      is: /^1[3-9](\d{9})$/i,
    },
    unique: 'account',
    comment: '账号 手机号',
  })
  account;

  @Column({
    type: DataTypes.STRING,
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
  @Column({ type: DataTypes.STRING, allowNull: true, comment: '用户头像' })
  avatar;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataTypes.STRING,
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
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      return dayjs(this.getDataValue('regisTime')).format('YYYY-MM-DD HH:mm');
    },
  })
  regisTime;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      return dayjs(this.getDataValue('updateTime')).format('YYYY-MM-DD HH:mm');
    },
  })
  updateTime;
}
