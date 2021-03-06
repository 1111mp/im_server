import { Op } from "sequelize/lib/sequelize";
import { STARREDISKEY, STARRCOUNTKEY, STARLOCK } from "../common/const";
import { getDynaSources } from "../common/controllers/dynaSource";
import { createOne, getAll } from "../common/controllers/comment";
import { getCount } from "../common/controllers/star";
import { getFileUrl } from "../common/utils";

const router = require("koa-router")();
// const AsyncLock = require('async-lock')
const db = require("../common/models");
const { Dynamic, DynaSource } = require("../common/models");

// const lock = new AsyncLock()

router.prefix("/dynamic");

/** 从缓存或数据库中获取动态的点赞总数 优先缓存 */
async function getStarCount(ctx, dynamicId) {
  let count;
  let redisCount = await ctx.redis.redis.hmget("starCounts", [dynamicId]);
  if (redisCount[0] === null) {
    count = await getCount(dynamicId);
    await ctx.redis.redis.hmset("starCounts", new Map([[dynamicId, count]]));
  } else {
    count = redisCount[0];
  }
  return Number(count);
}

/**
 * @description: 查询用户发表的所有动态
 * @param {number} userId 用户id
 * @param {number} pageNo 页码
 * @param {number} pageSize 分页大小
 * @return:
 */
router.post("/queryUserAllDynamic", async (ctx, next) => {
  const { pageNo, pageSize } = ctx.request.body;
  const { userId } = ctx;

  if (!userId) {
    ctx.throw(401, "Authentication Error");
    return false;
  }

  if (!pageNo || !pageSize) {
    ctx.body = {
      code: 400,
      msg: "pageNo or pageSize cannot be emptyed!",
    };
    return false;
  }

  try {
    let { rows: dynamics, count: totalCount } = await Dynamic.findAndCountAll({
      attributes: { exclude: ["updatedAt"] },
      where: {
        userId: {
          [Op.eq]: userId,
        },
      },
      offset: (pageNo - 1) * pageSize,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });

    dynamics = await Promise.all(
      dynamics.map(async (dynamic) => {
        /** 先序列化 再操作 */
        dynamic = dynamic.toJSON();
        dynamic["comments"] = await getAll({ userId, dynamicId: dynamic.id });
        dynamic["starCount"] = await getStarCount(ctx, dynamic.id);
        dynamic["images"] = await getDynaSources({
          userId,
          dynamicId: dynamic.id,
        });
        return dynamic;
      })
    );

    ctx.body = {
      code: 200,
      totalCount,
      data: dynamics,
    };
  } catch (err) {
    ctx.throw(400, err);
  }
});

/**
 * @description: 发布动态
 * @param {string} content 动态的内容
 * @param {strin[]} images 图片url
 * @return:
 */
router.post("/publish", async (ctx, next) => {
  const params = ctx.request.body;
  params.userId = ctx.userId;

  /** 上传成功之后的files对象 */
  let { files } = ctx.request.files;

  if (!params.userId) {
    ctx.throw(401, "Authentication Error");
    return false;
  }

  if (!params.content && !files) {
    ctx.body = {
      code: 400,
      msg: "content and files cannot both be emptyed!",
    };
    return false;
  }

  let urlArr = files ? getFileUrl(files) : [];
  try {
    await db.sequelize.transaction((t) => {
      return Dynamic.create(params, { transaction: t }).then((dynamic) => {
        return Promise.all(
          urlArr.map((url) => {
            return DynaSource.create(
              { userId: ctx.userId, dynamicId: dynamic.id, url },
              { transaction: t }
            );
          })
        );
      });
    });

    ctx.body = {
      code: 200,
      data: urlArr,
      msg: "publish dynamic successed",
    };
  } catch (err) {
    const msg = err.errors[0];
    ctx.body = {
      code: 400,
      data: `${msg.value} ${msg.message}`,
    };
  }
});

/**
 * @description: 评论
 * @param {number} dynamicId  动态id
 * @param {string} content  内容
 * @return:
 */
router.post("/comment", async (ctx, next) => {
  const params = ctx.request.body;
  const userId = ctx.userId;
  params["userId"] = userId;

  if (!params.dynamicId || !params.content) {
    ctx.body = {
      code: 400,
      msg: "dynamicId or content cannot be emptyed!",
    };
    return false;
  }

  try {
    await createOne(params);

    ctx.body = {
      code: 200,
      msg: "successed",
    };
  } catch (err) {
    ctx.body = {
      code: 400,
      msg: "error",
    };
  }
});

/**
 * @description: 点赞
 * @param {number} dynamicId 动态id
 * @param {0 | 1} status 动态id
 * @return:
 */
// https://blog.csdn.net/solocoder/article/details/83713626?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase
router.post("/star", async (ctx, next) => {
  const params = ctx.request.body;
  const userId = ctx.userId;

  if (!params.dynamicId || (params.status !== 0 && !params.status)) {
    ctx.body = {
      code: 400,
      msg: "dynamicId or status cannot be emptyed!",
    };
    return false;
  }

  if (params.status !== 0 && params.status !== 1) {
    ctx.body = {
      code: 400,
      msg: "the value of status must be 0 or 1!",
    };
    return false;
  }

  try {
    const lock = await ctx.redis.redlock.lock(STARLOCK, 1000);

    const key = `${userId}::${params.dynamicId}`;

    const redisCount = await ctx.redis.redis.hmget(STARRCOUNTKEY, [
      params.dynamicId,
    ]);
    const starData = await ctx.redis.redis.hmget(STARREDISKEY, [key]);

    let count = redisCount[0];
    if (count === null) {
      count = getCount(params.dynamicId);
    }
    count = Number(count);
    if (starData[0] === null && Number(starData[0]) !== params.status) {
      params.status === 1 ? count++ : count < 1 ? 0 : count--;

      try {
        await ctx.redis.redis
          .multi()
          .hmset(STARREDISKEY, new Map([[key, params.status]]))
          .hmset(STARRCOUNTKEY, new Map([[params.dynamicId, count]]))
          .exec((err, results) => {
            if (err) {
              ctx.throw(400, err);
            }
          });
        ctx.body = {
          code: 200,
          msg:
            params.status === 1 ? "like successed" : "cancel likes successed",
        };
        lock.unlock();
      } catch (err) {
        lock.unlock();
        throw err;
      }
    } else {
      ctx.body = {
        code: 400,
        msg: "please dont submit again",
      };
    }
  } catch (err) {
    ctx.throw(400, err);
  }
});

module.exports = router;

export {};
