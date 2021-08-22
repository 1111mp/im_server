declare enum MsgType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
}

interface Message {
  id: string;
  sender: number;
  reciver: number;
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

interface Notify {
  id: string;
  type: NotifyType;
  sender: UserAttributes;
  reciver: number;
  time: number;
  remark?: string;
  ext?: string;
}

declare enum Result {
  success = "successed",
  error = "failed",
  timeout = "timeouted",
}
