import { Model, Table, Column, DataType } from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table
export class Message extends Model<Message> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  })
  id: bigint;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  msgId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [['text', 'image', 'video', 'audio']], // ModuleIM.Common.MsgType
    },
  })
  type: ModuleIM.Common.MsgType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'groupId',
  })
  groupId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @Column({ type: DataType.STRING })
  content: string;

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
