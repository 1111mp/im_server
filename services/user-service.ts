import { DB } from "../db";
import { UserModel } from "../db/models/user";
import { UserRegister } from "../types/types";

export class UserService {
  public constructor(private db: DB) {}

  /**
   * creates a new user
   * @public
   * @method {save}
   * @param {UserRegister} user
   * @returns {UserModel}
   */
  public save = async (user: UserRegister): Promise<UserModel> => {
    return await this.db.User.create(user);
  };
}
