import {
  BuildOptions,
  DataTypes,
  HasOneGetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

import moment from "moment";
import { UserModel } from "./user";

interface NotifyAttributes {
  id: string;
  type: ModuleIM.Common.NotifyType;
  sender: number;
  receiver: number;
  status: ModuleIM.Common.NotifyStatus;
  time: string;
  remark: string;
  ext: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotifyCreationAttributes
  extends Optional<NotifyAttributes, "remark" | "ext"> {}

export interface NotifyModel
  extends Model<NotifyAttributes, NotifyCreationAttributes>,
    NotifyAttributes {
  getUser: HasOneGetAssociationMixin<UserModel>;
}

export type NotifyStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): NotifyModel;
};

export function NotifyFactory(sequelize: Sequelize) {
  return <NotifyStatic>sequelize.define("notify", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      validate: {
        isIn: [["0", "1", "2"]],
      },
      comment: "the type of notify",
    },
    sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "sender's userid",
    },
    receiver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "receiver's userid",
    },
    status: {
      type: DataTypes.INTEGER,
      validate: {
        isIn: [["0", "1", "2", "3", "4"]],
      },
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
    },
    ext: {
      type: DataTypes.JSON,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue("createdAt")).format(
          "YYYY-MM-DD HH:mm"
        );
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue("updatedAt")).format(
          "YYYY-MM-DD HH:mm"
        );
      },
    },
  });
}
