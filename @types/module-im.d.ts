namespace ModuleIM {
  namespace Core {
    type Message = {
      id: string;
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

    const enum MessageType {
      Message = 'message',
      Notify = 'notify',
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
  }
}
