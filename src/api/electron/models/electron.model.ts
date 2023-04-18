import { Model, Table, Column, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import * as dayjs from 'dayjs';

@Table
export class Electron extends Model<Electron> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [['macos', 'windows']],
    },
    comment: 'Electron App platform',
  })
  platform: Electron.Common.Platform;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [['x32', 'x64', 'arm64']],
    },
  })
  archs: Electron.Common.Archs;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Electron App version',
  })
  version: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Is it designated as an official version',
  })
  actived: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [['full', 'asar']],
    },
    comment: 'Full or incremental update',
  })
  type: Electron.Common.UpdateType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'JSON string',
  })
  ext: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  remark: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Whether to force update',
  })
  forceUpdate: boolean;

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
  createdAt: string;

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
  updatedAt: string;
}
