import { Optional } from "sequelize";
import { sign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { compareSync } from "bcrypt";
import { Config } from "../../config";

import { ParameterizedContext, Next } from "koa";
import { UserService } from "../services";
import { RedisType } from "../redis";

const { USER_AUTH_KEY } = process.env;

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
        code: StatusCode.BadRequest,
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
          code: StatusCode.ServerError,
          msg: "An unknown error occurred while generating the token.",
        });

      delete (new_user as Optional<UserAttributes, "pwd">).pwd;

      return (ctx.body = {
        code: StatusCode.Success,
        token,
        data: new_user,
      });
      // delete new_user.pwd;
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return (ctx.body = {
          code: StatusCode.UnprocesableEntity,
          msg: "The account already exists.",
        });
      } else {
        return (ctx.body = {
          code: StatusCode.ServerError,
          msg: `${err.name}: ${err.message}`,
        });
      }
    }
  };

  /**
   * @Post
   * @method {login}
   * @param ctx ParameterizedContext
   * @param next Next
   * @returns {Promise<BaseResponse>}
   */
  public login = async (ctx: ParameterizedContext, next: Next) => {
    const { account, pwd } = <UserLogin>ctx.query;

    if (!account || !pwd)
      return (ctx.body = {
        code: StatusCode.BadRequest,
        msg: "account or pwd cannot be empty",
      });

    try {
      const user = (
        await this.userService.getUserByAccount({ account })
      )?.toJSON() as UserAttributes;

      if (!user)
        return (ctx.body = {
          code: StatusCode.Forbidden,
          msg: "please register first",
        });

      const isPwd = compareSync(pwd, user.pwd);

      if (!isPwd)
        return (ctx.body = {
          code: StatusCode.Forbidden,
          msg: "Incorrect password",
        });

      // pwd is correct
      const token = await this.set_token(user, Config.tokenExp);

      if (token === "failed")
        return (ctx.body = {
          code: StatusCode.ServerError,
          msg: "Unknow error when generating token.",
        });

      delete (user as Optional<UserAttributes, "pwd">).pwd;

      return (ctx.body = {
        code: StatusCode.Success,
        token,
        data: user,
      });
    } catch (err) {
      return (ctx.body = {
        code: StatusCode.ServerError,
        msg: `${err.name}: ${err.message}`,
      });
    }
  };

  /**
   * @Post
   * @method {logout}
   * @param ctx ParameterizedContext<{}, { userId: number; headers: { token: string } }>
   * @param next Next
   * @returns {Promise<BaseResponse>}
   */
  public logout = async (
    ctx: ParameterizedContext<
      {},
      { userId: number; headers: { token: string } }
    >,
    next: Next
  ) => {
    const { token } = ctx.headers;

    await this.del_token(ctx.userId, token);

    return (ctx.body = {
      code: StatusCode.Success,
      msg: "Sign out successfully.",
    });
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
    const auth = `${USER_AUTH_KEY}::${user.id}`;
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

  /**
   * @description delete token by user
   * @method {del_token}
   * @param userId
   * @param token
   * @returns Promise<number>
   */
  private del_token = (userId: number, token: string) => {
    const auth = `${USER_AUTH_KEY}::${userId}`;

    return this.redis.instance.hdel(auth, token);
  };
}
