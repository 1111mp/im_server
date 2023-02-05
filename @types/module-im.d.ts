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
  }

  namespace Common {
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
