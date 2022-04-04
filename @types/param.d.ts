interface UserRegister {
  account: string;
  pwd: string;
}

type UserLogin = {
  account: string;
  pwd: string;
};

type GroupCreator = {
  type: 1 | 2;
  members: number[];
  name?: string;
  avatar?: string;
};

type AddFriend = {
  friendId: number;
  remark?: string;
  ext?: string;
};

//! https://stackoverflow.com/questions/40227401/const-enum-in-typescript/40227546#40227546
declare const enum StatusCode {
  Success = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  Timeout = 408,
  ServerError = 500,

  UnprocesableEntity = 422,
}
