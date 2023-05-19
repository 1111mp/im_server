import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import * as dayjs from 'dayjs';
import { User } from 'src/api/users/models/user.model';

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

  @ForeignKey(() => User)
  @ApiProperty({ type: 'number' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @BelongsTo(() => User)
  senderInfo: User;

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

  @ApiProperty({ type: 'number' })
  @Column({ type: DataType.BIGINT, allowNull: false })
  timer: number;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.SMALLINT })
  ext: string;

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
