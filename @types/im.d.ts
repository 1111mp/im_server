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
  receiver: number;
  status: MsgStatus;
  time: string;
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
  Received,
  Readed,
  Fulfilled,
  Rejected,
}

interface Notify {
  id: string;
  type: NotifyType;
  sender: UserAttributes;
  receiver: number;
  status: NotifyStatus;
  time: string;
  remark?: string;
  ext?: string;
}

declare enum Result {
  success = "successed",
  error = "failed",
  timeout = "timeouted",
}
