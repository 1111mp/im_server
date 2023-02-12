import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import * as dayjs from 'dayjs';
import { Message } from './message.model';

@Table
export class MessageRead extends Model<MessageRead> {
  @ForeignKey(() => Message)
  @Column({ primaryKey: true, type: DataType.STRING })
  id: string;

  @BelongsTo(() => Message)
  message: Message;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]], // ModuleIM.Common.Session
    },
  })
  session: ModuleIM.Common.Session;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3]], // ModuleIM.Common.MsgStatus
    },
  })
  status: ModuleIM.Common.MsgStatus;

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
