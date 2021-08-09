import { Optional } from "sequelize";
import { sign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { compareSync } from "bcrypt";
import { Config } from "../config";
import { USERAUTHKEY } from "../common/const";

import { ParameterizedContext, Next } from "koa";
import { UserAttributes } from "../db/models/user";
import { UserService } from "../services";
import { UserRegister, UserLogin } from "../types/types";
import { RedisType } from "../redis";

/**
 * @description User controller
 * @class
 * @public
 */
export class UserController {
  /**
   * @description	Creates an instance of user controller.
   * @constructor
   * @param {UserService} userService
   * @param {RedisType} redis
   */
  public constructor(
    private userService: UserService,
    private redis: RedisType
  ) {}

  /**
   * @Post
   * @method {register}
   * @param ctx ParameterizedContext
   * @param next Next
   * @returns {Promise<BaseResponse>}
   */
  public register = async (ctx: ParameterizedContext, next: Next) => {
    const user = <UserRegister>ctx.request.body;

    if (!user.account || !user.pwd) {
      return (ctx.body = {
        code: 400,
        msg: "account or pwd cannot be repeated",
      });
    }

    try {
      let new_user = (
        await this.userService.save(user)
      ).toJSON() as UserAttributes;

      const token = await this.set_token(new_user, Config.tokenExp);

      if (token === "failed")
        return (ctx.body = {
          code: 500,
          msg: "An unknown error occurred while generating the token.",
        });

      delete (new_user as Optional<UserAttributes, "pwd">).pwd;

      return (ctx.body = {
        code: 200,
        token,
        data: new_user,
      });
      // delete new_user.pwd;
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return (ctx.body = {
          code: 500,
          data: "The account already exists.",
        });
      } else {
        return (ctx.body = {
          code: 500,
          data: `${err.name}: ${err.message}`,
        });
      }
    }
  };

  public login = async (ctx: ParameterizedContext, next: Next) => {
    const { account, pwd } = <UserLogin>ctx.request.body;

    if (!account || !pwd)
      return (ctx.body = {
        code: 401,
        msg: "account or pwd cannot be empty",
      });

    try {
      const user = (
        await this.userService.getUserByAccount({ account })
      )?.toJSON() as UserAttributes;

      if (!user)
        return (ctx.body = {
          code: 403,
          msg: "please register first",
        });

      const isPwd = compareSync(pwd, user.pwd);

      if (!isPwd)
        return (ctx.body = {
          code: 403,
          msg: "Incorrect password",
        });

      // pwd is correct
      const token = await this.set_token(user, Config.tokenExp);

      if (token === "failed")
        return (ctx.body = {
          code: 500,
          msg: "Unknow error when generating token。",
        });

      delete (user as Optional<UserAttributes, "pwd">).pwd;

      return (ctx.body = {
        code: 200,
        token,
        data: user,
      });
    } catch (err) {
      return (ctx.body = {
        code: 500,
        msg: `${err.name}: ${err.message}`,
      });
    }
  };

  /**
   * @description generate token
   * @method {set_token}
   * @param {UserAttributes} user
   * @param {number} maxAge
   * @returns token string
   */
  private set_token = (
    user: UserAttributes,
    maxAge: number = 60 * 60 * 1000
  ): Promise<string> => {
    const auth = `${USERAUTHKEY}::${user.id}`;
    const key = uuidv4();
    const token = sign(user, process.env.SECRET_Key!);

    return new Promise((reslove) => {
      this.redis.instance
        .multi()
        .del(auth)
        .hset(auth, key, token)
        .expire(auth, maxAge)
        .exec((err, results) => {
          if (err) {
            // error
            reslove("failed");
          }
          reslove(key);
        });
    });
  };
}
