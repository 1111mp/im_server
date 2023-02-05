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
import { User } from 'src/users/models/user.model';

@Table
export class Friend extends Model<Friend> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id;

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

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId;

  @BelongsTo(() => User, { foreignKey: 'userId', targetKey: 'id' })
  user: User;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  friendId;

  @BelongsTo(() => User, { foreignKey: 'friendId', targetKey: 'id' })
  friend: User;
}
