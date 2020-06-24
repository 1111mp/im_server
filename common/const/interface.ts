export interface Message {
	msgId: string;
	type: 0 | 1 | 2 | 3 | 4 | 5; // 0 text 1 image 2 video 3 audio 4 customNotify 5 notification
	sessionType?: 0 | 1; // 0 单聊 1 群聊
	customType?: 0 | 1 | 2 | 3 | 4 | 5 | 6;	// 操作类型 0:请求添加好友 1：申请通过 2:拒绝 3：删除 4：忽略 5： 取消忽略 6：拉黑 7： 取消拉黑
	content?: string;
	time?: any;
	resPath?: string;
	status: 0 | 1 | 2 | 3 | 4; // 0 离线消息 1 服务端收到并转发出消息 2 接收者收到消息 未读 3 接收者收到消息 并已读 4 已删除
	sender: {
		userId: number;
		avatarUrl?: string;
		userName?: string;
	};
	reciver: number; //接收者 userId or groupId
	// groupId?: number;
	ext?: string; // 预留字段 json格式
}

export declare type IAnyObject = Record<string, any>;

export interface InvokeData {
	type: string;
	token: string;
	args: IAnyObject;
}

export declare type Callback = (res: any) => {}