import * as Router from "@koa/router";
import { ElectronController } from "../controllers/electron.controller";
import { ElectronService } from "../services";
import { DB } from "src/db";
import { RedisType } from "src/redis";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  /**
   * @swagger
   * tags:
   *  name: Electron
   *  description: Operations about Electron.
   */
  api.prefix("/api/electron");

  const controller = new ElectronController(new ElectronService(db, redis));

  api.get("/appInfo", async () => {});

  api.get("/appInfoForAsar", controller.appInfoForAsar);

  /**
   * @swagger
   * /api/electron/fullUpload:
   *  post:
   *    summary: upload(full) the files of Electron App.
   *    description: upload(full) the files of Electron App.
   *    tags:
   *      - Electron
   *    consumes:
   *      - multipart/form-data
   *    produces:
   *      - application/json
   *    parameters:
   *    - name: platform
   *      in: formData
   *      description: electron app platform.
   *      required: true
   *      type: string
   *    - name: version
   *      in: formData
   *      description: electron app version.
   *      required: true
   *      type: string
   *    - name: archs
   *      in: formData
   *      description: electron app archs, it's required when platform is windows.
   *      required: false
   *      type: string
   *    - name: app
   *      in: formData
   *      description: files to upload.
   *      required: true
   *      type: array
   *      items:
   *        type: file
   *        format: binary
   *    - name: yml
   *      in: formData
   *      description: latest.yml to upload.
   *      required: true
   *      type: file
   *    responses:
   *      200:
   *        description: upload files successed.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            msg:
   *              type: string
   *              default: Upload successed.
   */
  api.post("/fullUpload", controller.fullUpload);

  /**
   * @swagger
   * /api/electron/asarUpload:
   *  post:
   *    summary: upload(asar) the files of Electron App.
   *    description: upload(asar) the files of Electron App.
   *    tags:
   *      - Electron
   *    consumes:
   *      - multipart/form-data
   *    produces:
   *      - application/json
   *    parameters:
   *    - name: platform
   *      in: formData
   *      description: electron app platform.
   *      required: true
   *      type: string
   *    - name: version
   *      in: formData
   *      description: electron app version.
   *      required: true
   *      type: string
   *    - name: app
   *      in: formData
   *      description: files to upload.
   *      required: true
   *      type: array
   *      items:
   *        type: file
   *        format: binary
   *    responses:
   *      200:
   *        description: upload files successed.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            msg:
   *              type: string
   *              default: Upload successed.
   */
  api.post("/asarUpload", controller.asarUpload);

  return api;
}
