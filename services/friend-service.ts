import { Op } from "sequelize";
import { DB } from "db";
import { RedisType } from "redis";

/**
 * @description	Friend service
 * @class
 * @public
 */
export class FriendService {
  /**
   * @description create an instance of Friend service
   * @constructor
   * @param db DB
   * @param redis RedisType
   */
  public constructor(private db: DB, private redis: RedisType) {}

  public is_friend = async (userId: number, friendId: number) => {
    const friend = await this.db.Friend.findOne({
      where: {
        [Op.or]: [
          {
            userId,
            friendId,
          },
          {
            userId: friendId,
            friendId: userId,
          },
        ],
      },
    });

    return friend ? true : false;
  };

  public find_and_count_all = (userId: number) => {
    return this.db.Friend.findAndCountAll({
      attributes: ["userId", "friendId"],
      where: {
        [Op.or]: [{ userId }, { friendId: userId }],
      },
    });
  };

  public get_sender = (sender: number) => {
    return this.db.User.findOne({
      attributes: {
        exclude: ["pwd"],
      },
      where: {
        id: sender,
      },
    });
  };
}
