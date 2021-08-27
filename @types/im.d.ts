declare enum MsgType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
}

declare enum Session {
  Single,
  Group,
}

declare enum MsgStatus {
  Initial,
  Sented,
  Received,
  Readed,
}

interface Message {
  id: string;
  session: Session;
  sender: UserAttributes;
  reciver: number;
  status: MsgStatus;
  time: number;
  ext?: string; // reserved field
}

interface MessageText extends Message {
  type: MsgType.Text;
  text: string;
}

interface MessageImage extends Message {
  type: MsgType.Image;
  image: string;
}

declare enum NotifyType {
  FriendAdd,
  FriendDel,
  FriendSet,
}

declare enum NotifyStatus {
  Initial,
  Readed,
  Fulfilled,
  Rejected,
}

interface Notify {
  id: string;
  type: NotifyType;
  sender: UserAttributes;
  reciver: number;
  status: NotifyStatus;
  time: number;
  remark?: string;
  ext?: string;
}

declare enum Result {
  success = "successed",
  error = "failed",
  timeout = "timeouted",
}
