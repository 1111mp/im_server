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
import { FriendSetting } from './friend-setting.model';

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

  @ForeignKey(() => FriendSetting)
  @Column(DataType.INTEGER)
  userId;

  @BelongsTo(() => FriendSetting, {
    foreignKey: 'userId',
    targetKey: 'friendId',
  })
  infoFromUser: FriendSetting;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  friendId;

  @BelongsTo(() => FriendSetting, {
    foreignKey: 'friendId',
    targetKey: 'friendId',
  })
  infoFromFriend: FriendSetting;
}
