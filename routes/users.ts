import {
  queryAll,
  register,
  getUserInfoByAccount,
} from "../common/controllers/user";

const router = require("koa-router")();

router.prefix("/users");

router.get("/", async function (ctx, next) {
  ctx.body = "this is a users response!";
});

/** 获取所有user */
router.post("/queryAll", queryAll);

/** 用户注册 */
router.post("/register", register);

/**
 * @description: 通过 account 获取用户信息
 * @param {number} account  账号 手机号
 * @return {*}
 */
router.post("/getUserByAccount", async (ctx, next) => {
  const params = ctx.request.body;

  if (!params.account) {
    return (ctx.body = {
      code: 400,
      msg: "account cannot be empty",
    });
  }

  try {
    const userInfo = await getUserInfoByAccount(
      ctx.redis.redis,
      params.account
    );

    return (ctx.body = {
      code: 200,
      data: userInfo,
    });
  } catch (error) {
    return (ctx.body = {
      code: 500,
      msg: `${error.name}: ${error.message}`,
    });
  }
});

module.exports = router;
