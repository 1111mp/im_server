export interface Message {
  msgId: string;
  type: 0 | 1 | 2 | 3 | 4 | 5; // 0 text 1 image 2 video 3 audio
  sessionType: 0 | 1; // 0 单聊 1 群聊
  content: string;
  time?: any;
  status: 0 | 1 | 2 | 3 | 4; // 0 离线消息 1 服务端收到并转发出消息 2 接收者收到消息 未读 3 接收者收到消息 并已读 4 已删除
  sender: number;
  receiver: number; //接收者 userId or groupId
  ext?: string; // 预留字段 json string格式
}

export type Notify = {
  msgId: string;
  type: 1 | 2 | 3; // 1 添加好友 2 删除好友 3 修改好友相关设置
  status: 0 | 1 | 2 | 3; // 0 初始状态 1 已读 2 同意 3 拒绝
  sender: number;
  receiver: number;
  senderInfo?: string; // 通知发起者的 信息
  remark?: string;
  time?: number;
  ext?: string; // 预留字段 json string格式
};

export type AckResponse = {
  code: number;
  msg: string;
};

export declare type IAnyObject = Record<string, any>;

export interface InvokeData {
  type: string;
  token: string;
  args: IAnyObject;
}

export declare type Callback = (res: any) => {};
