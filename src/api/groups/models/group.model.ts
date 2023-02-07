import {
  Model,
  Table,
  Column,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import * as dayjs from 'dayjs';
import { Member } from './member.model';
import { User } from 'src/api/users/models/user.model';

@Table
export class Group extends Model<Group> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '群组名称',
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '群组头像',
  })
  avatar: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]],
    },
    comment: '群组类型 1基础群 2超大群',
  })
  type: ModuleIM.Common.GroupType;

  @Column({
    type: DataType.INTEGER,
    comment: '群组创建者userId',
    allowNull: false,
  })
  creator: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('createdAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  createdAt?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updatedAt?: string;

  @BelongsToMany(() => User, () => Member)
  members: User[];
}
