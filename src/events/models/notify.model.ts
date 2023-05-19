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
import { User as UserModel } from 'src/api/users/models/user.model';

@Table
export class Notify extends Model<Notify> {
  @Column({ primaryKey: true, type: DataType.STRING })
  id: string;

  @ApiProperty({ type: 'number', required: true })
  @Column({
    type: DataType.INTEGER,
    validate: {
      isIn: [[1, 2]], // ModuleIM.Common.Notifys
    },
    comment: 'the type of notify',
  })
  type: ModuleIM.Common.Notifys;

  @ApiProperty({ type: 'number', required: true })
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @BelongsTo(() => UserModel, { foreignKey: 'sender', targetKey: 'id' })
  senderInfo: UserModel;

  @ApiProperty({ type: 'number', required: true })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @ApiProperty({ type: 'number', required: true })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3, 4, 5]], // ModuleIM.Common.NotifyStatus
    },
  })
  status: ModuleIM.Common.NotifyStatus;

  @ApiProperty({ type: 'number', required: true })
  @Column({ type: DataType.BIGINT, allowNull: false })
  timer: number;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.STRING })
  remark: string;

  @ApiProperty({ type: 'string' })
  @Column({ type: DataType.SMALLINT })
  ext: string;

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
  createdAt;

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
  updatedAt;
}
