import { Model, Table, Column, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import * as dayjs from 'dayjs';

@Table
export class Message extends Model<Message> {
  @ApiProperty({ type: 'bigint' })
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  })
  id: bigint;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  msgId: string;

  @ApiProperty({ enum: ['text', 'image', 'video', 'audio'] })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [['text', 'image', 'video', 'audio']], // ModuleIM.Common.MsgType
    },
  })
  type: ModuleIM.Common.MsgType;

  @ApiProperty({ type: 'number' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @ApiProperty({ type: 'number' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'groupId',
  })
  groupId: number;

  @ApiProperty({ type: 'number' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.STRING })
  content: string;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.STRING, allowNull: false })
  timer: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('createdAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  createdAt;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updatedAt;
}
