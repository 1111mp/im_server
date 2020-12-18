import { getNotifyKey } from "../../common/const";

const router = require("koa-router")();

router.prefix("/im");

router.post("/getOfflineMsgs", async (ctx) => {
  const { pageNo, pageSize, complete } = ctx.request.body;
  const key = `offline::${ctx.userId}`;
  try {
    /** http://www.52im.net/thread-594-1-1.html
     * 不用每一页消息都ACK，在拉取第二页消息时相当于第一页消息的ACK，此时服务器再删除第一页的离线消息即可，最后一页消息再ACK一次
     * 这样的效果是，不管拉取多少页离线消息，只会多一个ACK请求，与服务器多一次交互。
     * 这种方式 性能比较差 会造成客户端长时间等待 体验差
     * 所以做一些优化  并发获取所有离线消息
     */
    if (!complete) {
      const startIndex = (pageNo - 1) * pageSize,
        endIndex = pageNo * pageSize - 1;

      const msgs = await ctx.redis.redis.lrange(key, startIndex, endIndex);

      // async function aaa() {
      //   return new Promise((resolve) => {
      //     setTimeout(() => {
      //       resolve();
      //     }, 300);
      //   });
      // }

      // await aaa();

      ctx.body = {
        code: 200,
        data: {
          // hasMore: length > pageSize,
          msgs: [...msgs],
        },
      };
      return;
    }

    /**　清空　redis离线消息缓存 */
    // await ctx.redis.redis.ltrim(key, 1, 0);

    ctx.body = { code: 200 };
  } catch (error) {
    const err = error.errors[0];
    ctx.body = {
      code: 500,
      data: `${err.value} ${err.message}`,
    };
  }
});

/**
 * @description:
 * @param {number} pageNo
 * @param {number} pageSize
 * @param {boolean} complete
 * @return {*}
 */
router.post("/getOfflineNotify", async (ctx) => {
  const { pageNo, pageSize, complete } = ctx.request.body;
  const key = getNotifyKey(ctx.userId, true);
  try {
    if (!complete) {
      const startIndex = (pageNo - 1) * pageSize,
        endIndex = pageNo * pageSize - 1;

      const notifys = await ctx.redis.redis.lrange(key, startIndex, endIndex);

      return (ctx.body = {
        code: 200,
        data: {
          // hasMore: length > pageSize,
          msgs: [...notifys],
        },
      });
    }

    /**　清空　redis离线消息缓存 */
    await ctx.redis.redis.ltrim(key, 1, 0);

    return (ctx.body = { code: 200, msg: "successed" });
  } catch (error) {
    return (ctx.body = {
      code: 500,
      msg: `${error.name}: ${error.message}`,
    });
  }
});

/**
 * @description: 已读 聊天消息或通知
 * @param {required 1|2} type  1 消息 2 通知
 * @param {string} msgId  消息/通知 id
 * @return {*}
 */
router.post("/read", async (ctx) => {
  const { type, msgId } = ctx.request.body;

  if (!type || !msgId)
    return (ctx.body = {
      code: 400,
      msg: "type or msgId cannot be emptyed",
    });
});

module.exports = router;
