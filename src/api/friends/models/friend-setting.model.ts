import { ApiProperty } from '@nestjs/swagger';
import { Model, Table, Column, DataType } from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table
export class FriendSetting extends Model<FriendSetting> {
  @ApiProperty({ type: 'number' })
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ApiProperty({ type: 'number' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '用户id',
  })
  userId: number;

  @ApiProperty({ type: 'number' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '好友id',
  })
  friendId: number;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataType.STRING,
    comment: '好友备注',
  })
  remark?: string;

  @ApiProperty({ type: 'boolean' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '星标好友',
  })
  astrolabe: boolean;

  @ApiProperty({ type: 'boolean' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否拉黑',
  })
  block: boolean;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('createdAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  createdAt: string;

  @ApiProperty({ type: 'string' })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updatedAt: string;
}
