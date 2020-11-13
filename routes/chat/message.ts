const router = require("koa-router")();

router.prefix("/chat");

router.post("/getOfflineMsgs", async (ctx) => {
  const { pageNo, pageSize, ack } = ctx.request.body;

  const key = `offline::${ctx.userId}`;

  try {
    /** http://www.52im.net/thread-594-1-1.html
     * 不用每一页消息都ACK，在拉取第二页消息时相当于第一页消息的ACK，此时服务器再删除第一页的离线消息即可，最后一页消息再ACK一次
     * 这样的效果是，不管拉取多少页离线消息，只会多一个ACK请求，与服务器多一次交互。
     */
    if (pageNo > 1 || ack) {
      await ctx.redis.redis.ltrim(key, pageSize, -1);
    }

    if (!ack) {
      const length = await ctx.redis.redis.llen(key);
      const msgs = await ctx.redis.redis.lrange(key, 0, pageSize - 1);

      ctx.body = {
        code: 200,
        data: {
          hasMore: length > pageSize,
          msgs: [...msgs],
        },
      };
      return;
    }

    ctx.body = { code: 200 };
  } catch (error) {
    const err = error.errors[0];
    ctx.body = {
      code: 500,
      data: `${err.value} ${err.message}`,
    };
  }
});

module.exports = router;
