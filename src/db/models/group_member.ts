import {
  Sequelize,
  DataTypes,
  Model,
  BuildOptions,
  Optional,
  BelongsToGetAssociationMixin,
} from "sequelize";
import * as moment from "moment";
import { UserModel } from "./user";

export interface GroupMemberAttributes {
  id: number;
  groupId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupMemberCreationAttributes
  extends Optional<GroupMemberAttributes, "id"> {}

export interface GroupMemberModel
  extends Model<GroupMemberAttributes, GroupMemberCreationAttributes>,
    GroupMemberAttributes {
  getUser: BelongsToGetAssociationMixin<UserModel>;
}

export type GroupMemberStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): GroupMemberModel;
};

export function GroupMemberFactory(sequelize: Sequelize) {
  return <GroupMemberStatic>sequelize.define("group_member", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "群id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "用户id",
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
