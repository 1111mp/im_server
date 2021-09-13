import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

import moment from "moment";

interface NotifyAttributes {
  id: string;
  type: NotifyType;
  sender: number;
  reciver: number;
  status: NotifyStatus;
  time: number;
  remark: string;
  ext: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotifyModel
  extends Model<NotifyAttributes>,
    NotifyAttributes {}

export type NotifyStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): NotifyModel;
};

export function NotifyFactory(sequelize: Sequelize) {
  return <NotifyStatic>sequelize.define("notify", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: {
      type: DataTypes.INTEGER,
    },
  });
}
