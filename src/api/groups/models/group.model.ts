import {
  Model,
  Table,
  Column,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import * as dayjs from 'dayjs';
import { Member } from './member.model';
import { User } from 'src/api/users/models/user.model';

@Table
export class Group extends Model<Group> {
  @ApiProperty({ type: 'number', example: 1 })
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id?: number;

  @ApiProperty({ type: 'string', example: 'name' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '群组名称',
  })
  name: string;

  @ApiProperty({ type: 'string', example: 'avatar url' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '群组头像',
  })
  avatar: string;

  @ApiProperty({ enum: [1, 2] })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]],
    },
    comment: '群组类型 1基础群 2超大群',
  })
  type: ModuleIM.Common.GroupType;

  @ApiProperty({ type: 'number', example: 10007 })
  @Column({
    type: DataType.INTEGER,
    comment: '群组创建者userId',
    allowNull: false,
  })
  creator: number;

  @ApiProperty({ type: 'string', example: '' })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('createdAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  createdAt?: string;

  @ApiProperty({ type: 'string', example: '' })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updatedAt?: string;

  @BelongsToMany(() => User, () => Member)
  members: User[];
}
