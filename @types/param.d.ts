interface UserRegister {
  account: string;
  pwd: string;
}

interface UserLogin {
  account: string;
  pwd: string;
}

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
