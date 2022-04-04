import * as Router from "@koa/router";
import { UserController } from "../controllers/user.controller";
import { DB } from "../db";
import { RedisType } from "../redis";
import { UserService } from "../services";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  /**
   * @swagger
   * tags:
   *  name: Users
   *  description: Operations about user.
   */

  /**
   * @swagger
   * definitions:
   *  User:
   *    type: object
   *    properties:
   *      id:
   *        type: integer
   *      account:
   *        type: string
   *        example: '176XXXXXXXX'
   *      avatar:
   *        type: string
   *      email:
   *        type: string
   *      regisTime:
   *        type: string
   *      updateTime:
   *        type: string
   *  UserResponse:
   *    type: object
   *    properties:
   *      code:
   *        type: integer
   *        default: 200
   *      token:
   *        type: string
   *        example: '28aeb634-95c1-4b57-983a-6bc0d0238042'
   *      data:
   *        description: user info
   *        $ref: "#/definitions/User"
   *
   */
  api.prefix("/api/user");

  const userController = new UserController(new UserService(db), redis);

  /**
   * @swagger
   * /api/user/register:
   *  post:
   *    summary: user login
   *    description: user login
   *    tags:
   *      - Users
   *    produces:
   *      - application/json
   *    parameters:
   *    - name: account
   *      in: formData
   *      required: true
   *      type: string
   *    - name: pwd
   *      in: formData
   *      required: true
   *      type: string
   *    responses:
   *      200:
   *        description: user register.
   *        schema:
   *          $ref: "#/definitions/UserResponse"
   *      422:
   *        description: The account already exists.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 422
   *            msg:
   *              type: string
   *              default: 'The account already exists.'
   */
  api.post("/register", userController.register);

  /**
   * @swagger
   * /api/user/login:
   *  get:
   *    summary: user login
   *    description: user login
   *    tags:
   *      - Users
   *    produces:
   *      - application/json
   *    parameters:
   *    - name: account
   *      in: query
   *      description: The user account for login
   *      required: true
   *      type: string
   *      example: '176XXXXXXXX'
   *    - name: pwd
   *      in: query
   *      description: The user password for login
   *      required: true
   *      type: string
   *      example: "**********"
   *    responses:
   *      200:
   *        description: login successed.
   *        schema:
   *          $ref: "#/definitions/UserResponse"
   */
  api.get("/login", userController.login);

  /**
   * @swagger
   * /api/user/logout:
   *  post:
   *    summary: user login
   *    description: user login
   *    tags:
   *      - Users
   *    responses:
   *      200:
   *        description: logout successed.
   *        schema:
   *          type: object
   *          properties:
   *            code:
   *              type: integer
   *              default: 200
   *            msg:
   *              type: string
   *              default: 'Sign out successfully.'
   *    security:
   *      - token: []
   *      - userid: []
   */
  api.post("/logout", userController.logout);

  return api;
}
