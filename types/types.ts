export interface UserRegister {
  account: string;
  pwd: string;
}

export interface UserLogin {
  account: string;
  pwd: string;
}

export type GroupCreator = {
  type: 1 | 2;
  members: number[];
  name?: string;
  avatar?: string;
};
