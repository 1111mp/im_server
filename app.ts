import * as Koa from "koa";
import * as views from "koa-views";
import * as json from "koa-json";
import * as onerror from "koa-onerror";
import * as koaBody from "koa-body";
import * as compose from "koa-compose";
import * as staticServ from "koa-static";
import * as cors from "koa2-cors";

import initRedis from "./common/middlewares/redis";
import Auth from "./common/middlewares/auth";
import logs, { createLogger } from "./common/middlewares/logger";
import timerTask from "./common/utils/timerTask";
import asycStarData from "./common/utils/syncStarData";
import Config from "./config";

const routes = require("./routes");
require("./common/models");

const app = new Koa();

// error handler
onerror(app);

app.use(cors());

const middlewares = [
  async (ctx, next) => {
    /** 将logs设置到ctx上 方便后续使用 */
    ctx.log4js = logs;
    await next();
  },
  // 处理Auth中throw的401错误
  async (ctx, next) => {
    return next().catch((err) => {
      if (401 == err.status) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          msg: "Protected resource, use Authorization header to get access",
        };
      } else {
        throw err;
      }
    });
  },
  initRedis(),
  /** http://www.ptbird.cn/koa-body.html */
  json(),
  koaBody({
    multipart: true,
    // encoding: 'gzip',
    formidable: {
      uploadDir: Config.uploadPath,
      keepExtensions: true,
      maxFieldsSize: 2 * 1024 * 1024,
      onFileBegin: (name, file) => {
        // console.log(`name: ${name}`)
        // console.log(`file: ${file}`)
      },
    },
  }),
  Auth().unless({ path: Config.unlessPaths }),
  createLogger(),
  staticServ(__dirname + "/public"),
  views(__dirname + "/views", {
    extension: "pug",
  }),
];

app.use(compose(middlewares));

// routes
Object.keys(routes).map((route) => {
  app.use(routes[route].routes()).use(routes[route].allowedMethods());
});

/** 定时任务 */
timerTask(asycStarData);

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

export default app;
