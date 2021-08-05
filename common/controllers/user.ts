import Redis from "ioredis";
import { setToken } from "../utils/auth";
import { USERINFOKEY } from "../const";
import { Config } from "../../config";

const { User, FriSetting } = require("../models");
const { Op } = require("sequelize/lib/sequelize");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");

/** 获取所有用户 */
export const queryAll = async (ctx) => {
  const data = await User.findAll();
  ctx.body = {
    code: 200,
    data,
  };
};

/** 注册用户 */
export async function register(ctx) {
  const params = ctx.request.body;

  if (!params.account || !params.pwd) {
    return (ctx.body = {
      code: 400,
      msg: "account or pwd cannot be repeated",
    });
  }

  try {
    let user = (await User.create(params)).toJSON();

    console.log(user);
    user = {
      ...user,
      userId: user.id,
    };

    delete user["id"];

    const key = await setToken(ctx.redis.redis, user, Config.tokenExp);

    if (key === "failed") return (ctx.body = { code: 500, msg: "redis error" });

    delete user["pwd"];

    return (ctx.body = {
      code: 200,
      token: key,
      data: user,
    });
  } catch (err) {
    return (ctx.body = {
      code: 500,
      data: `${err.name}: ${err.message}`,
    });
  }
}

/** 获取用户信息
 * 先从redis中获取 再读数据库
 */
export const getUserInfoByUserId = async (redis: Redis.Redis, userId) => {
  let userInfo;

  if (await redis.hexists(USERINFOKEY, `${userId}`)) {
    /** redis中存在数据 */
    userInfo = await redis.hget(USERINFOKEY, `${userId}`);

    return JSON.parse(userInfo);
  } else {
    try {
      userInfo = (
        await User.findOne({
          attributes: {
            include: [
              ["id", "userId"],
              "account",
              "avatar",
              "email",
              "regisTime",
              "updateTime",
            ],
            exclude: ["pwd", "id"],
          },
          where: {
            id: {
              [Op.eq]: userId,
            },
          },
        })
      ).toJSON();

      await redis.hset(USERINFOKEY, `${userId}`, JSON.stringify(userInfo));

      return userInfo;
    } catch (err) {
      console.log(err);
      return {};
    }
  }
};

/** 获取好友信息 */
export const getFriendInfo = async (ctx, userId, friendId) => {
  let friendInfo = await ctx.redis.redis.hgetall(`friendInfo::${friendId}`);

  if (friendInfo && JSON.stringify(friendInfo) !== "{}") {
    return friendInfo;
  } else {
    try {
      friendInfo = await FriSetting.findOne({
        attributes: ["remark", "tags", "astrolabe", "block"],
        where: {
          userId: {
            [Op.eq]: userId,
          },
          friendId: {
            [Op.eq]: friendId,
          },
        },
      });

      await ctx.redis.redis.hset(`friendInfo::${friendId}`, friendInfo);

      return friendInfo;
    } catch (err) {
      return {};
    }
  }
};

export async function getUserInfoByAccount(
  redis: Redis.Redis,
  account: string
) {
  let userInfo;

  if (await redis.hexists(USERINFOKEY, account)) {
    userInfo = await redis.hget(USERINFOKEY, account);

    userInfo = JSON.parse(userInfo);
  } else {
    userInfo = await User.findOne({
      attributes: {
        include: [
          ["id", "userId"],
          "account",
          "avatar",
          "email",
          "regisTime",
          "updateTime",
        ],
        exclude: ["pwd", "id"],
      },
      where: {
        account: {
          [Op.eq]: account,
        },
      },
    });

    userInfo = userInfo.toJSON();

    await redis.hset(USERINFOKEY, account, JSON.stringify(userInfo));
  }

  return userInfo;
}
