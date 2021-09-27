import { v4 } from "uuid";
import { getNotifyKey } from "../common/const";
import { Message, Notify } from "../common/const/interface";
import {
  addFriend,
  delFriend,
  queryAll,
  friendShip,
} from "../common/controllers/friend";
import { getNotifyByMsgIdFromRedis, delNtyByValue } from "../common/IM/utils";

const router = require("koa-router")();
const { Notify: NotifyModel } = require("../common/models");

router.prefix("/friend");

/**
 * @description: 好友操作
 * @param {required 1|2|3|4} type	好友操作类型	1：添加好友	2：删除好友 3：同意 4：拒绝
 * @param {number} friendId	好友的userId
 * @param {string} remark 备注
 * @param {json string} ext 扩展字段
 * @param {string} msgId 通知的id
 * @return:
 */
router.post("/handle", async (ctx, next) => {
  const { type, friendId, remark, ext, msgId } = ctx.request.body;

  if (!type) {
    return (ctx.body = {
      code: 400,
      msg: "type cannot be emptyed",
    });
  }

  switch (type) {
    case 1: {
      if (!friendId)
        return (ctx.body = {
          code: 400,
          msg: "type cannot be emptyed",
        });

      const isFriend = await friendShip({ userId: ctx.userId, friendId });
      if (isFriend) {
        /** 已经是好友 */
        return (ctx.body = {
          code: 400,
          msg: "It's already a good friend relationship, don't repeat submit.",
        });
      }

      const notify: Notify = {
        msgId: v4(),
        type: 1,
        sender: ctx.userId,
        receiver: friendId,
        status: 0,
        time: Date.now(),
        remark,
        ext,
      };

      const result = await (global as any).ChatInstance.sendNotify(
        ctx,
        friendId,
        notify
      );

      if (result === "failed")
        return (ctx.body = {
          code: 500,
          msg: "failed",
        });

      return (ctx.body = {
        code: 200,
        msg: "successed",
      });
    }
    case 2:
      await delFriend(ctx, next);
      return;
    case 3: {
      /** 同意加为好友 */
      if (!msgId)
        return (ctx.body = {
          code: 400,
          msg: "msgId cannot be emptyed",
        });

      const { notify } = await getNotifyByMsgIdFromRedis(
        ctx.redis.redis,
        ctx.userId,
        msgId
      );

      if (!notify)
        return (ctx.body = {
          code: 410,
          msg: "The notice has expired",
        });

      const { sender } = notify;

      const dbRes = await addFriend(ctx.userId, sender);

      if (!dbRes) return (ctx.body = { code: 500, msg: "db error" });

      await (global as any).ChatInstance.sendNotify(
        ctx,
        sender,
        { ...notify, status: 2 },
        false
      );

      // 将缓存中的通知入库 并删除
      let flag: boolean = false;
      try {
        await NotifyModel.create({ ...notify, status: 2 });
        flag = true;
      } catch (error) {
        // 通知消息入库失败
      }

      flag &&
        (await delNtyByValue(
          ctx.redis.redis,
          ctx.userId,
          JSON.stringify(notify)
        ));

      return (ctx.body = {
        code: 200,
        msg: "successed",
      });
    }
    case 4: {
      // 拒绝加好友
      if (!msgId)
        return (ctx.body = {
          code: 400,
          msg: "msgId cannot be emptyed",
        });

      const { notify, index } = await getNotifyByMsgIdFromRedis(
        ctx.redis.redis,
        ctx.userId,
        msgId
      );

      if (!notify)
        return (ctx.body = {
          code: 410,
          msg: "The notice has expired",
        });

      const { sender } = notify;

      await (global as any).ChatInstance.sendNotify(
        ctx,
        sender,
        { ...notify, status: 3 },
        false
      );

      // 将缓存中的通知入库 并删除
      let succ: boolean = false;
      try {
        await NotifyModel.create({ ...notify, status: 3 });
        succ = true;
      } catch (error) {
        // 通知消息入库失败
      }

      succ &&
        (await delNtyByValue(
          ctx.redis.redis,
          ctx.userId,
          JSON.stringify(notify)
        ));
      return;
    }
  }
});

router.post("", async () => {});

/**
 * @description: 获取好友列表
 * @param {type}
 * @return:
 */
router.post("/queryAll", queryAll);

module.exports = router;
