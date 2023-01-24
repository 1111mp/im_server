import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

import dayjs from "dayjs";

type FriendSettingAttributes = {
  id: number;
  userId: number;
  friendId: number;
  remark: string;
  tags: string;
  astrolabe: boolean;
  black: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FriendSettingModel = Model<FriendSettingAttributes> &
  FriendSettingAttributes & {};

export type FriendSettingStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): FriendSettingModel;
};

export function FriendSettingFactory(sequelize: Sequelize) {
  return <FriendSettingStatic>sequelize.define(
    "friend_setting",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        allowNull: false,
        comment: "用户id",
      },
      friendId: {
        type: DataTypes.INTEGER,
        field: "friend_id",
        allowNull: false,
        comment: "好友id",
      },
      remark: {
        type: DataTypes.STRING,
        comment: "好友备注",
      },
      tags: {
        type: DataTypes.STRING,
        comment: "好友标签",
      },
      astrolabe: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "星标好友",
      },
      block: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否拉黑",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return dayjs(this.getDataValue("createdAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return dayjs(this.getDataValue("updatedAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
    },
    {
      indexes: [
        {
          using: "BTREE",
          fields: ["user_id", "friend_id"],
        },
      ],
    }
  );
}
