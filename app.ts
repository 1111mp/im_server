import * as Koa from "koa";
import * as views from "koa-views";
import * as json from "koa-json";
import * as onerror from "koa-onerror";
import { koaBody } from "koa-body";
import * as compose from "koa-compose";
import * as staticServ from "koa-static";

import { Auth } from "./src/middleware/Auth";
import { Config } from "./config";

import { db } from "./src/db";
import { redis } from "./src/redis";
import { routes } from "./src/routes";
import { IMInitialization } from "./src/IM";
import type { Server } from "http";

/** 定时任务 */
// timerTask(asycStarData);

export function koaApp() {
  db.sequelize
    .authenticate()
    .then(() => {
      console.info("connected to db");
      db.sequelize.sync({ alter: true });
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
    app.use(
      require("koa2-cors")({
        origin: function (ctx) {
          return "http://localhost:1212";
        },
        exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "Accept",
          "token",
          "userId",
        ],
      })
    );
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
        maxFieldsSize: Infinity,
        maxFileSize: Infinity,
        onFileBegin: (name, file) => {
          // console.log(`name: ${name}`);
          // console.log(file);
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

  // register router
  const routers = routes(db, redis);
  Object.keys(routers).forEach((name) => {
    const router = routers[name];
    app.use(router.routes()).use(router.allowedMethods());
  });

  // error-handling
  app.on("error", (err, ctx) => {
    console.error("server error", err, ctx);
  });

  return {
    app,
    generator: (http_server: Server) => {
      app.context.im = IMInitialization(http_server, db, redis);
    },
  };
}
