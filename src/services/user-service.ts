import { DB } from "../db";
import { UserModel } from "../db/models/user";

/**
 * @description User Service
 * @class
 * @public
 */
export class UserService {
  /**
   * @description: Create an instance of user service.
   * @constructor
   * @param {*} private
   */  
  public constructor(private db: DB) {}

  /**
   * creates a new user
   * @public
   * @method {save}
   * @param {UserRegister} user
   * @returns {UserModel}
   */
  public save = (user: User.Params.UserRegister): Promise<UserModel> => {
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
  }: Pick<User.Params.UserLogin, "account">): Promise<UserModel | null> => {
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
