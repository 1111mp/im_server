import * as Router from "@koa/router";
import { FriendService } from "../services";
import { FriendController } from "../controllers/friend.controller";
import { DB } from "../db";
import { RedisType } from "../redis";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  /**
   * @swagger
   * tags:
   *  name: Friend
   *  description: Operations about Friend.
   * definitions:
   *  FriendInfo:
   *    type: object
   *    properties:
   *      id:
   *        type: integer
   *      userId:
   *        type: integer
   *      friendId:
   *        type: integer
   *      userGroup:
   *        type: string
   *      friendGroup:
   *        type: string
   *      createdAt:
   *        type: string
   *      updatedAt:
   *        type: string
   */
  api.prefix("/api/friend");

  const friendController = new FriendController(new FriendService(db, redis));

  /**
   * get user all friends
   *
   * @swagger
   * /api/friend/getFriends:
   *  get:
   *    summary: get user friends.
   *    description: get user friends.
   *    tags:
   *      - Friend
   *    produces:
   *      application/json
   *    responses:
   *      200:
   *        description: get user friends info.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            data:
   *              type: array
   *              items:
   *                allOf:
   *                  - $ref: '#/definitions/FriendInfo'
   *                  - $ref: '#/definitions/User'
   *    security:
   *      - token: []
   *      - userid: []
   */
  api.get("/getFriends", friendController.get_friends);

  /**
   * add friend
   *
   * @swagger
   * /api/friend/addFriend:
   *  post:
   *    summary: add friend.
   *    description: add friend.
   *    tags:
   *      - Friend
   *    produces:
   *      application/json
   *    parameters:
   *    - name: friendId
   *      type: integer
   *      required: true
   *      description: userid.
   *    - name: remark
   *      type: string
   *    - name: ext
   *      type: string
   *    responses:
   *      200:
   *        description: add friend successed.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            msg:
   *              type: string
   *              default: Added successfully, please wait for confirmation from the other side.
   *    security:
   *    - token: []
   *    - userid: []
   */
  api.post("/addFriend", friendController.friend_add);
  //
  api.post("/");

  return api;
}
