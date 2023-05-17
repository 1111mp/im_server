import { Optional } from 'sequelize';

declare global {
  namespace User {
    interface UserAttributes {
      id: number;
      account: string;
      pwd: string;
      avatar: string | null;
      email: string | null;
      regisTime: string;
      updateTime: string;
    }

    // Some fields are optional when calling UserModel.create() or UserModel.build()
    interface UserCreationAttributes
      extends Optional<
        UserAttributes,
        'id' | 'avatar' | 'email' | 'regisTime' | 'updateTime'
      > {}

    type UserInfo = Omit<UserAttributes, 'pwd'> & RoleModel.Role;
  }

  namespace Params {
    type UserRegister = {
      account: string;
      pwd: string;
    };

    type UserLogin = {
      account: string;
      pwd: string;
    };
  }
}
