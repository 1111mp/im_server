interface UserAttributes {
  id: number;
  account: string;
  pwd: string;
  avatar: string | null;
  email: string | null;
  regisTime: string;
  updateTime: string;
  createdAt?: Date;
  updatedAt?: Date;
}
