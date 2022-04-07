import * as Router from "@koa/router";
import { dirname as dirnameFun, join } from "path";
import { ParameterizedContext } from "koa";
import { DB } from "src/db";
import { RedisType } from "src/redis";
import { Config } from "../../config";
import * as fs from "fs-extra";
import { File } from "formidable";

const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(dirnameFun(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
};

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  api.prefix("/api/electron");

  api.post("/update", async (ctx: ParameterizedContext) => {
    const files = ctx.request.files!;
    const { platform, version, archs } = <
      { platform: string; version: string; archs: string }
    >ctx.request.body;

    const appPath = join(
      Config.uploadPath,
      platform,
      platform === "windows" ? archs : "",
      version,
      "/"
    );

    if (fs.existsSync(appPath)) {
      for (let name in files) {
        const file = files[name];
        if (Array.isArray(file)) {
          file.forEach((f) => fs.remove(f.path));
        } else {
          fs.remove(file.path);
        }
      }
      return (ctx.body = {
        code: StatusCode.UnprocesableEntity,
        msg: `The current version[${version}] already exists under the platform[${platform}].`,
      });
    }

    mkdirsSync(appPath);

    for (let name in files) {
      const curFile = files[name];
      if (Array.isArray(curFile)) {
        curFile.forEach((file) => {
          const { name, path } = file;
          fs.renameSync(path, appPath + name);
        });
      } else {
        const { name, path } = curFile;
        fs.renameSync(path, appPath + name);
      }
    }

    ctx.body = { code: StatusCode.Success, msg: "Upload successed." };
  });

  return api;
}
