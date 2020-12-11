import Config from "../../../config";
import * as log4js from "koa-log4";

const ip = require("./ip");
const env = process.env;
const { NODE_ENV } = env;

function getBaseInfo(ctx) {
  return {
    // host: ctx.headers ? ctx.headers.host : '',
    s_ip: ip.server(),
    c_ip: ip.client(ctx.req),
    query_string: JSON.stringify(ctx.query),
  };
}

const logs = {
  // 控制台输出
  con(str, ctx) {
    const logger = log4js.getLogger("console");
    logger.debug(str);
  },
  conlog(log = {}) {
    try {
      const logger = log4js.getLogger("conlog");
      logger.info(JSON.stringify(Object.assign({}, log)));
    } catch (e) {
      console.error(e);
    }
  },
  apiAccess(ctx, log = {}) {
    try {
      const logger = log4js.getLogger("api-access");
      logger.info(
        JSON.stringify(
          Object.assign(
            getBaseInfo(ctx),
            {
              url: ctx.url,
              method: ctx.method,
            },
            log
          )
        )
      );
    } catch (e) {
      console.error(e);
    }
  },
  apiError(err, ctx, log = {}) {
    try {
      const logger = log4js.getLogger("api-error");
      logger.error(
        JSON.stringify(
          Object.assign(
            getBaseInfo(ctx),
            {
              url: ctx.url,
              stack: err && (err.stack || err.toString()),
            },
            log
          )
        )
      );
    } catch (e) {
      console.error(e);
    }
  },
  // 记录错误日志
  error(err, ctx) {
    try {
      const logger = log4js.getLogger("error");
      logger.error(
        JSON.stringify(
          Object.assign(getBaseInfo(ctx), {
            url: ctx.url,
            stack: err && (err.stack || err.toString()),
          })
        )
      );
    } catch (e) {
      console.log(e);
    }
  },
};

export function createLogger() {
  let logConf = Config.logConfig;

  if (NODE_ENV === "prod") {
    logConf["pm2"] = true;
  }

  log4js.configure(logConf);

  return log4js.koaLogger(log4js.getLogger("http"), {
    format: function (ctx, fn) {
      const info = {
        url: fn(":url"),
        method: fn(":method"),
        status: fn(":status"),
        referrer: fn(":referrer"),
        "remote-addr": fn(":remote-addr"),
        "response-time": fn(":response-time"),
        "user-agent": fn(":user-agent"),
      };

      return JSON.stringify(Object.assign(getBaseInfo(ctx), info));
    },
  });
}

// https://github.com/log4js-node/log4js-example
export default logs;
