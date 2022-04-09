declare namespace ModuleIM {
  namespace Params {
    type GroupCreator = {
      type: 1 | 2;
      members: number[];
      name?: string;
      avatar?: string;
    };
  }

  namespace Core {
    type Message = {
      id: string;
      session: Common.Session;
      sender: User.DB.UserAttributes;
      receiver: number;
      status: Common.MsgStatus;
      time: string;
      ext?: string; // reserved field
    };

    type MessageText = Message & {
      type: Common.MsgType.Text;
      text: string;
    };

    type MessageImage = Message & {
      type: Common.MsgType.Image;
      image: string;
    };

    type Notify = {
      id: string;
      type: Common.NotifyType;
      sender: User.DB.UserAttributes;
      receiver: number;
      status: Common.NotifyStatus;
      time: string;
      remark?: string;
      ext?: string;
    };
  }

  namespace Common {
    const enum MsgType {
      Text = "text",
      Image = "image",
      Video = "video",
      Audio = "audio",
    }

    const enum Session {
      Single,
      Group,
    }

    const enum MsgStatus {
      Initial,
      Sented,
      Received,
      Readed,
    }

    const enum NotifyType {
      FriendAdd,
      FriendDel,
      FriendSet,
    }

    const enum NotifyStatus {
      Initial,
      Received,
      Readed,
      Fulfilled,
      Rejected,
    }

    const enum Result {
      success = "successed",
      error = "failed",
      timeout = "timeouted",
    }
  }
}
