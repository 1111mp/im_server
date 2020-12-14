import { v4 } from "uuid";
import { Message, Notify } from "../common/const/interface";
import { getUserInfoByUserId } from "../common/controllers/user";
import {
  addFriend,
  delFriend,
  getAll,
  friendShip,
} from "../common/controllers/friend";

const router = require("koa-router")();

router.prefix("/friend");

/**
 * @description: 好友操作
 * @param {1|2|3} type	好友操作类型	1：添加好友	2：删除好友 3：修改好友相关设置
 * @return:
 */
router.post("/handle", async (ctx, next) => {
  const { type, friendId, remark, ext } = ctx.request.body;

  if (!type || !friendId) {
    ctx.body = {
      code: 400,
      msg: "type or friendId cannot be emptyed",
    };
    return false;
  }

  switch (type) {
    case 1:
      const isFriend = await friendShip({ userId: ctx.userId, friendId });
      if (isFriend) {
        /** 已经是好友 */
        return (ctx.body = {
          code: 400,
          msg: "It's already a good friend relationship, don't repeat submit.",
        });
      }

      const dbRes = await addFriend(ctx, next);

      if (!dbRes) return (ctx.body = { code: 500, msg: "db error" });

      const notify: Notify = {
        msgId: v4(),
        type: 1,
        sender: ctx.userId,
        reciver: friendId,
        status: 0,
        time: Date.now(),
        remark,
        ext,
      };
      const senderInfo = await getUserInfoByUserId(ctx.redis.redis, ctx.userId);

      const result = (global as any).ChatInstance.sendNotify(
        friendId,
        notify,
        senderInfo
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
    case 2:
      await delFriend(ctx, next);
      return;
  }
});

/**
 * @description: 获取好友列表
 * @param {type}
 * @return:
 */
router.post("/getAll", getAll);

module.exports = router;
