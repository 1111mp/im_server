namespace ModuleIM {
  namespace Core {
    type MessageBasic = {
      id: bigint;
      msgId: string;
      type: Common.MsgType;
      sender: number;
      senderInfo: Omit<User.UserAttributes, 'pwd'>;
      groupId?: number;
      receiver: number; // userId or groupId
      content: string;
      timer: number;
      ext?: string; // reserved field
    };

    type MessageRead = {
      id: bigint;
      sender: number;
      groupId?: number;
      receiver: number;
    };

    type Notify = {
      id: string;
      type: Common.Notifys;
      sender: Omit<User.UserAttributes, 'pwd'>;
      receiver: number;
      status: Common.NotifyStatus;
      timer: number;
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
