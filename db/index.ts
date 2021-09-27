import { Sequelize } from "sequelize";

// https://github.com/EnetoJara/resume-app/blob/master/src/server/models/index.ts
import { UserFactory, UserStatic } from "./models/user";
import { FriendFactory, FriendStatic } from "./models/friend";
import {
  FriendSettingFactory,
  FriendSettingStatic,
} from "./models/friend_setting";
import { ChatGroupFactory, ChatGroupStatic } from "./models/chat_group";
import { GroupMemberFactory, GroupMemberStatic } from "./models/group_member";
import { NotifyFactory, NotifyStatic } from "./models/notify";

export type DB = {
  sequelize: Sequelize;
  User: UserStatic;
  Friend: FriendStatic;
  FriendSetting: FriendSettingStatic;
  ChatGroup: ChatGroupStatic;
  GroupMember: GroupMemberStatic;
  Notify: NotifyStatic;
};

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+08:00",
    define: {
      charset: "utf8",
    },
    dialectOptions: {
      // collate: "utf8_general_ci",
    },
  }
);

const User = UserFactory(sequelize);
const Friend = FriendFactory(sequelize);
const FriendSetting = FriendSettingFactory(sequelize);
const ChatGroup = ChatGroupFactory(sequelize);
const GroupMember = GroupMemberFactory(sequelize);
const Notify = NotifyFactory(sequelize);

ChatGroup.hasMany(GroupMember, { foreignKey: "groupId", sourceKey: "id" });
GroupMember.belongsTo(ChatGroup, { foreignKey: "groupId", targetKey: "id" });
GroupMember.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
Notify.hasOne(User, { foreignKey: "id", sourceKey: "sender" });

export const db: DB = {
  sequelize,
  User,
  Friend,
  FriendSetting,
  ChatGroup,
  GroupMember,
  Notify,
};
