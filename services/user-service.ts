import { DB } from "../db";
import { UserModel } from "../db/models/user";
import { UserLogin, UserRegister } from "../types/types";

/**
 * @description User Service
 * @class
 * @public
 */
export class UserService {
  public constructor(private db: DB) {}

  /**
   * creates a new user
   * @public
   * @method {save}
   * @param {UserRegister} user
   * @returns {UserModel}
   */
  public save = (user: UserRegister): Promise<UserModel> => {
    return this.db.User.create(user);
  };

  /**
   * @public
   * @description get user by account
   * @method {getUserByAccount}
   * @param account string
   * @returns	Promise<UserModel | null>
   */
  public getUserByAccount = ({
    account,
  }: Pick<UserLogin, "account">): Promise<UserModel | null> => {
    return this.db.User.findOne({
      attributes: [
        "id",
        "account",
        "pwd",
        "avatar",
        "email",
        "regisTime",
        "updateTime",
      ],
      where: {
        account,
      },
    });
  };
}
