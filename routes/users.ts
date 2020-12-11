import { queryAll, register } from "../common/controllers/user";

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
router.post("/getUserByAccount", async (ctx, next) => {});

module.exports = router;

export {};
