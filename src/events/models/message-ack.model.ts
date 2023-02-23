// Record the ack status of the message

import { Model, Table, Column, DataType } from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table({
  indexes: [
    {
      using: 'BTREE',
      fields: ['receiver', 'lastAck', 'lastAckErr'],
    },
  ],
})
export class MessageAck extends Model<MessageAck> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    comment: "receiver's userid",
  })
  receiver: number;

  // @ForeignKey(() => Message)
  @Column({ type: DataType.BIGINT, allowNull: true })
  lastAck: bigint;

  @Column({ type: DataType.BIGINT, allowNull: true })
  lastAckErr: bigint;

  // @BelongsTo(() => Message, { foreignKey: 'lastAck', targetKey: 'id' })
  // message: Message;

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
