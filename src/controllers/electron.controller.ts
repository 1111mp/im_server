import * as fs from "fs-extra";
import { join } from "path";
import { ParameterizedContext } from "koa";
import { ElectronService } from "src/services";
import { Config } from "../../config";
import { removeFiles, mkdirsSync } from "../utils/files";

/**
 * @description: electron controller
 * @class
 * @public
 */
export class ElectronController {
  /**
   * @description: create an instance of Electron controller
   * @constructor
   * @param {ElectronService} electronService
   */
  public constructor(private service: ElectronService) {}

  public getInfo = async (ctx: ParameterizedContext) => {};

  /**
   * @description: full upload the files of Electron App
   * @param {ParameterizedContext} ctx
   * @return {*}
   */
  public fullUpload = async (ctx: ParameterizedContext) => {
    const files = ctx.request.files!;
    const { platform, version, archs } = <Electron.Params.FullUpload>(
      ctx.request.body
    );

    try {
      const appPath = join(
        Config.uploadPath,
        "electron",
        Electron.Common.UpdateType.Full,
        version,
        platform,
        platform === Electron.Common.Platform.Windows ? archs : "",
        "/"
      );

      if (fs.existsSync(appPath)) {
        removeFiles(files);
        return (ctx.body = {
          code: Response.StatusCode.UnprocesableEntity,
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

      await this.service.create({
        type: Electron.Common.UpdateType.Full,
        platform,
        version,
        archs,
        url: join(
          "electron",
          Electron.Common.UpdateType.Full,
          version,
          platform,
          platform === Electron.Common.Platform.Windows ? archs : ""
        ),
      });

      ctx.body = {
        code: Response.StatusCode.Success,
        msg: "Upload successed.",
      };
    } catch (err) {
      removeFiles(files);
      ctx.body = {
        code: Response.StatusCode.ServerError,
        msg: `${err.name}: ${err.message}`,
      };
    }
  };

  /**
   * @description: asar upload the files of Electron App
   * @param {ParameterizedContext} ctx
   * @return {*}
   */
  public asarUpload = async (ctx: ParameterizedContext) => {
    const files = ctx.request.files;
    if (!files || !files["app"])
      return (ctx.body = {
        code: Response.StatusCode.BadRequest,
        msg: "The file of formData cannot be empty.",
      });

    const { platform, version } = <Electron.Params.AsarUpload>ctx.request.body;

    if (!platform || !version)
      return (ctx.body = {
        code: Response.StatusCode.BadRequest,
        msg: "Invalid parameter.",
      });

    try {
      const appPath = join(
        Config.uploadPath,
        "electron",
        Electron.Common.UpdateType.Asar,
        version,
        platform,
        "/"
      );

      if (fs.existsSync(appPath)) {
        removeFiles(files);
        return (ctx.body = {
          code: Response.StatusCode.UnprocesableEntity,
          msg: `The current version[${version}] already exists under the platform[${platform}].`,
        });
      }

      mkdirsSync(appPath);

      const curFile = files["app"];

      // windows one file | macos two files
      if (Array.isArray(curFile)) {
        curFile.forEach((file) => {
          const { name, path } = file;
          fs.renameSync(path, appPath + name);
        });

        await this.service.createMultiple(
          curFile.map(({ name, path }) => ({
            type: Electron.Common.UpdateType.Asar,
            platform,
            version,
            archs: name?.split(".")[0] as Electron.Common.Archs,
            url: join(
              "electron",
              Electron.Common.UpdateType.Asar,
              version,
              platform,
              name!
            ),
          }))
        );
      } else {
        const { name, path } = curFile;
        fs.renameSync(path, appPath + name);

        await this.service.create({
          type: Electron.Common.UpdateType.Asar,
          platform,
          version,
          archs: name?.split(".")[0] as Electron.Common.Archs,
          url: join(
            "electron",
            Electron.Common.UpdateType.Asar,
            version,
            platform,
            name!
          ),
        });
      }

      ctx.body = {
        code: Response.StatusCode.Success,
        msg: "Upload successed.",
      };
    } catch (err) {
      removeFiles(files);
      ctx.body = {
        code: Response.StatusCode.ServerError,
        msg: `${err.name}: ${err.message}`,
      };
    }
  };

  public appInfoForAsar = async (ctx: ParameterizedContext) => {
    const { platform, archs, version } = <Electron.Params.InfoForAsar>ctx.query;

    if (!platform || !archs || !version)
      return (ctx.body = {
        code: Response.StatusCode.BadRequest,
        msg: "Invalid parameter.",
      });

    const info = await this.service.findOne(version, archs);

    if (!info)
      return (ctx.body = {
        code: Response.StatusCode.Success,
        msg: "No update available.",
      });

    // nedd to compare version

    return (ctx.body = {
      code: Response.StatusCode.Success,
      data: info.toJSON(),
    });
  };
}
