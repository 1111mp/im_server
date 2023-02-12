namespace ModuleIM {
  namespace Core {
    type MessageBasic = {
      id: string;
      session: Common.Session;
      sender: Omit<User.UserAttributes, 'pwd'>;
      receiver: number; // userId or groupId
      status: Common.MsgStatus;
      timer: string;
      ext?: string; // reserved field
    };

    type MessageText = MessageBasic & {
      type: Common.MsgType.Text;
      text: string;
    };

    type MessageImage = MessageBasic & {
      type: Common.MsgType.Image;
      image: string;
    };

    type MessageAll = MessageText | MessageImage;

    type MessageRead = {
      id: string;
      session: Common.Session;
      sender: number;
      receiver: number; // userId or groupId
      status: Common.MsgStatus;
    };

    type Notify = {
      id: string;
      type: Common.Notifys;
      sender: Omit<User.UserAttributes, 'pwd'>;
      receiver: number;
      status: Common.NotifyStatus;
      timer: string;
      remark?: string;
      ext?: string;
    };

    type Group = {
      id: number;
      name: string;
      avatar?: string;
      type: Common.GroupType;
      creator: number;
      createdAt?: string;
      updatedAt?: string;
    };
  }

  namespace Common {
    const enum GroupType {
      Basic = 1, // 200
      Big, // 2000
    }

    const enum MessageEventNames {
      Message = 'on-message',
      Notify = 'on-notify',
      Read = 'on-message:read',
    }

    const enum Notifys {
      AddFriend = 1,
      DelFriend,
    }

    const enum NotifyStatus {
      Initial = 1,
      Received,
      Readed,
      Fulfilled,
      Rejected,
    }

    const enum Session {
      Single = 1,
      Group,
    }

    const enum MsgType {
      Text = 'text',
      Image = 'image',
      Video = 'video',
      Audio = 'audio',
    }

    const enum MsgStatus {
      Initial = 1,
      Received,
      Readed,
    }
  }
}
