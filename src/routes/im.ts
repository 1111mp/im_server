import * as Router from "@koa/router";
import { IMController } from "../controllers/im.controller";
import { DB } from "../db";
import { RedisType } from "../redis";
import { IMService } from "../services";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  /**
   * @swagger
   * tags:
   *  name: IM
   *  description: Operations about IM.
   * definitions:
   *  GroupInfo:
   *    type: object
   *    properties:
   *      id:
   *        type: integer
   *      name:
   *        type: string
   *      avatar:
   *        type: string
   *      creator:
   *        type: integer
   *      type:
   *        type: integer
   *        enum:
   *          - 1
   *          - 2
   *      max:
   *        type: integer
   *        enum:
   *          - 200
   *          - 2000
   *      createdAt:
   *        type: string
   *      updatedAt:
   *        type: string
   *      members:
   *        type: array
   *        items:
   *          $ref: '#/definitions/User'
   */
  api.prefix("/api/im");

  const imController = new IMController(new IMService(db, redis));

  /**
   * @swagger
   * /api/im/createGroup:
   *  post:
   *    summary: create im group.
   *    description: create IM group.
   *    tags:
   *      - IM
   *    produces:
   *      - application/json
   *    parameters:
   *    - in: body
   *      name: body
   *      required: true
   *      description: for create Im group.
   *      schema:
   *        properties:
   *          type:
   *            type: integer
   *            description: IM group type.
   *            enum:
   *              - 1
   *              - 2
   *          avatar:
   *            type: string
   *          name:
   *            type: string
   *          members:
   *            type: array
   *            items:
   *              $ref: '#/definitions/User'
   *    responses:
   *      200:
   *        description: create IM group.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            data:
   *              $ref: '#/definitions/GroupInfo'
   *    security:
   *      - token: []
   *      - userid: []
   */
  api.post("/createGroup", imController.create_group);
  
  /**
   * @swagger
   * /api/im/getGroupInfoById:
   *  get:
   *    summary: get IM group info.
   *    description: get IM group info.
   *    tags:
   *      - IM
   *    produces:
   *      - application/json
   *    parameters:
   *    - name: id
   *      in: query
   *      type: integer
   *      required: true
   *    responses:
   *      200:
   *        description: IM group info.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            data:
   *              $ref: '#/definitions/GroupInfo'
   *      403:
   *        description: The group does not exist.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integert
   *              default: 403
   *            msg:
   *              type: string
   *              default: The group does not exist.
   *    security:
   *      - token: []
   *      - userid: []
   */
  api.get("/getGroupInfoById", imController.getGroupInfoById);

  return api;
}
