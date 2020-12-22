import { getUserInfoByUserId } from "./user";

const db = require("../models");
const { Friend, User, FriSetting } = require("../models");
const { Op } = require("sequelize/lib/sequelize");

/**
 * @description: 添加好友
 * @param {number} friendId	好友的userId
 * @return:
 */
export async function addFriend(
  userId: number,
  friendId: number
): Promise<boolean> {
  try {
    await db.sequelize.transaction((t) => {
      return Friend.create({ userId: userId, friendId }, { transaction: t })
        .then((friend) => {
          return FriSetting.create(
            { userId: userId, friendId },
            { transaction: t }
          );
        })
        .then((res) => {
          return FriSetting.create(
            { userId: friendId, friendId: userId },
            { transaction: t }
          );
        });
    });

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * @description: 删除好友
 * @param {number} friendId	好友的userId
 * @return:
 */
export async function delFriend(ctx, next) {
  const { friendId } = ctx.request.body;
  const userId = ctx.userId;

  if (!friendId) {
    ctx.body = {
      code: 400,
      msg: "friendId cannot be emptyed",
    };
    return false;
  }

  try {
    await Friend.destroy({
      where: {
        [Op.or]: [
          {
            userId: {
              [Op.eq]: userId,
            },
            friendId: {
              [Op.eq]: friendId,
            },
          },
          {
            userId: {
              [Op.eq]: friendId,
            },
            friendId: {
              [Op.eq]: userId,
            },
          },
        ],
      },
    });

    ctx.body = {
      code: 200,
      msg: "delete success",
    };
  } catch (err) {
    const msg = err.errors[0];
    ctx.body = {
      code: 400,
      data: `${msg.value} ${msg.message}`,
    };
  }
}

/** 判断是否是好友 */
export async function friendShip(params: {
  userId: number;
  friendId: number;
}): Promise<boolean> {
  const count: number = await Friend.count({
    where: {
      [Op.or]: [
        {
          userId: {
            [Op.eq]: params.userId,
          },
          friendId: {
            [Op.eq]: params.friendId,
          },
        },
        {
          userId: {
            [Op.eq]: params.friendId,
          },
          friendId: {
            [Op.eq]: params.userId,
          },
        },
      ],
    },
  });

  if (count <= 0) return false;
  return true;
}

export async function queryAll(ctx) {
  const userId = ctx.userId;

  try {
    let { rows: friendIds, count: totalCount } = await Friend.findAndCountAll({
      attributes: ["userId", "friendId"],
      where: {
        [Op.or]: [
          {
            userId: {
              [Op.eq]: userId,
            },
          },
          {
            friendId: {
              [Op.eq]: userId,
            },
          },
        ],
      },
    });

    const friends: any[] = await Promise.all(
      friendIds.map(async (friend) => {
        friend = friend.toJSON();

        const friendId =
          friend.userId === userId ? friend.friendId : friend.userId;

        const baseInfo = await getUserInfoByUserId(ctx.redis.redis, friendId);

        const settings = (
          await FriSetting.findOne({
            attributes: {
              exclude: ["id", "userId", "friendId", , "createdAt", "updateAt"],
            },
            where: {
              userId: {
                [Op.eq]: userId,
              },
              friendId: {
                [Op.eq]: friendId,
              },
            },
          })
        ).toJSON();

        return {
          ...baseInfo,
          ...settings,
        };
      })
    );

    return (ctx.body = {
      code: 200,
      data: {
        totalCount,
        friends,
      },
    });
  } catch (err) {
    return (ctx.body = {
      code: 500,
      data: `${err.name}: ${err.message}`,
    });
  }
}
