// Record the ack and read status of the message

import {
  Model,
  Table,
  Column,
  DataType,
} from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table({
  indexes: [
    {
      using: 'BTREE',
      fields: ['sender', 'receiver'],
    },
  ],
})
export class MessageExt extends Model<MessageExt> {
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

  @Column({ type: DataType.INTEGER, allowNull: true })
  groupId: number;

  // @ForeignKey(() => Message)
  @Column({ type: DataType.BIGINT })
  lastAck: bigint;

  // @BelongsTo(() => Message, { foreignKey: 'lastAck', targetKey: 'id' })
  // message: Message;

  @Column({ type: DataType.BIGINT })
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
