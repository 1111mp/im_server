import * as Koa from "koa";
import * as views from "koa-views";
import * as json from "koa-json";
import * as onerror from "koa-onerror";
import * as koaBody from "koa-body";
import * as compose from "koa-compose";
import * as staticServ from "koa-static";

import { Auth } from "./middleware/auth";
import logs, { createLogger } from "./common/middlewares/logger";
import timerTask from "./common/utils/timerTask";
import asycStarData from "./common/utils/syncStarData";
import { Config } from "./config";

import { db } from "./db";
import { redis } from "./redis";
import { routes } from "./route";

/** 定时任务 */
// timerTask(asycStarData);

export function koaApp() {
  db.sequelize
    .authenticate()
    .then(() => {
      console.info("connected to db");
      // db.sequelize.sync({ alter: true });
      // db.sequelize.sync({ force: true });
    })
    .catch((error) => {
      console.error(error);
      throw "error";
    });

  redis.instance.on("ready", () => {
    console.info("connected to redis");
  });

  redis.instance.on("error", (err: Error) => {
    console.error({
      message: "Error with redis client",
      errorMessage: err.message,
      errorStack: err.stack,
      errorName: err.name,
    });
  });

  const app: Koa = new Koa();

  // error handler
  onerror(app);

  if (process.env.NODE_ENV === "production") {
    // production
  } else {
    // development
    app.use(require("koa2-cors")());
  }

  const middlewares = [
    // async (ctx, next) => {
    //   /** 将logs设置到ctx上 方便后续使用 */
    //   ctx.log4js = logs;
    //   await next();
    // },
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
    json(),
    /** http://www.ptbird.cn/koa-body.html */
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
    Auth(redis).unless({ path: Config.unlessPaths }),
    // createLogger(),
    staticServ(__dirname + "/public"),
    views(__dirname + "/views", {
      extension: "pug",
    }),
  ];

  app.use(compose(middlewares));

  const router = routes(db, redis);
  app.use(router.routes()).use(router.allowedMethods());

  // error-handling
  app.on("error", (err, ctx) => {
    console.error("server error", err, ctx);
  });

  return app;
}
