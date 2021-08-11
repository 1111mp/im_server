import { DB } from "db";
import { RedisType } from "redis";
import { GroupCreator } from "../types/types";

/**
 * @description IM Service
 * @class
 * @public
 */
export class IMService {
  /**
   * @description Creates an instance of im service
   * @constructor
   * @param db DB
   * @param redis RedisType
   */
  public constructor(private db: DB, private redis: RedisType) {}

  /**
   * @public
   * @description create a new chat group
   * @method {create_group}
   * @param param	GroupCreator & { creator: number }
   * @returns Promise<{ group: object; members: object[]; }>
   */
  public create_group = ({
    type,
    avatar,
    name,
    members,
    creator,
  }: GroupCreator & { creator: number }) => {
    return this.db.sequelize.transaction(async (t) => {
      const chat_group = await this.db.ChatGroup.create(
        {
          type,
          max: type === 1 ? 200 : 2000,
          creator,
          avatar,
          name,
        },
        {
          transaction: t,
        }
      );

      const model_members = await Promise.all(
        [...members, creator].map((member) =>
          this.db.GroupMember.create(
            { groupId: chat_group.id, userId: member },
            { transaction: t }
          )
        )
      );

      try {
        const group_members = await Promise.all(
          model_members.map(async (member) =>
            (
              await member.getUser({
                attributes: {
                  exclude: ["pwd"],
                },
              })
            ).toJSON()
          )
        );

        return { group: chat_group.toJSON(), members: group_members };
      } catch (err) {
        // Raise errors manually so that Sequelize handles everything automatically.
        throw new Error();
      }
    });
  };

  /**
   * @public
   * @description find group & members by id
   * @method {getGroupInfoById}
   * @param id number
   * @returns Promise<{ group: null; members?: undefined; } | { group: ChatGroupModel; members: object[]; }>
   */
  public getGroupInfoById = async (id: number) => {
    const group = await this.db.ChatGroup.findOne({ where: { id } });

    if (!group) return { group: null };

    const members = await Promise.all(
      (
        await group.getGroup_members()
      ).map(async (member) =>
        (await member.getUser({ attributes: { exclude: ["pwd"] } })).toJSON()
      )
    );

    return {
      group,
      members,
    };
  };
}
