import {
  Sequelize,
  Model,
  DataTypes,
  BuildOptions,
  Optional,
  HasManyGetAssociationsMixin,
} from "sequelize";
import * as moment from "moment";
import { GroupMemberModel } from "./group_member";

type GroupSizeAttributes =
  | {
      type: 1;
      max: 200;
    }
  | {
      type: 2;
      max: 2000;
    };

export type ChatGroupAttributes = GroupSizeAttributes & {
  id: number;
  name: string;
  avatar: string;
  creator: number;
  createdAt?: Date;
  updatedAt?: Date;
};

interface ChatGroupCreationAttributes
  extends Optional<ChatGroupAttributes, "id" | "avatar" | "name"> {}

export type ChatGroupModel = Model<
  ChatGroupAttributes,
  ChatGroupCreationAttributes
> &
  ChatGroupAttributes & {
    getGroup_members: HasManyGetAssociationsMixin<GroupMemberModel>;
  };

export type ChatGroupStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): ChatGroupModel;
};

export function ChatGroupFactory(sequelize: Sequelize) {
  return <ChatGroupStatic>sequelize.define(
    "chat_group",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: "null",
        comment: "群组名称",
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "null",
        comment: "群组头像",
      },
      type: {
        type: DataTypes.INTEGER,
        validate: {
          isIn: [["1", "2"]],
        },
        comment: "群组类型 1基础群 2超大群",
      },
      max: {
        type: DataTypes.INTEGER,
        validate: {
          isIn: [["200", "2000"]],
        },
        comment: "群组成员数量限制",
      },
      creator: {
        type: DataTypes.INTEGER,
        field: "group_creator",
        comment: "群组创建者userId",
        allowNull: false,
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
    },
    {
      initialAutoIncrement: "10000",
    }
  );
}
