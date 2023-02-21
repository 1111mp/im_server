// Record the read status of the message

import { Model, Table, Column, DataType } from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table({
  indexes: [
    {
      using: 'BTREE',
      fields: ['sender', 'receiver', 'lastRead'],
    },
  ],
})
export class MessageRead extends Model<MessageRead> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userId or groupId",
  })
  sender: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  lastRead: bigint;

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
