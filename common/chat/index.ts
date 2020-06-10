const { secretOrPrivateKey } = require('config')
const jwt = require('jsonwebtoken')
const RedisStore = require('../middlewares/redis/redis')
const _ = require('lodash')

const METHODS: string[] = [
	'invoke',
	'disconnect'
]

declare type IAnyObject = Record<string, any>;

interface InvokeData {
	type: string;
	token: string;
	args: IAnyObject;
}

declare type Callback = (res: any) => {}

interface Message {
	msgId: string;
	type: 0 | 1 | 2 | 3; // 0 text 1 image 2 video 3 audio 
	sessionType: 0 | 1; // 0 单聊 1 群聊
	content?: string;
	time?: any;
	resPath?: string;
	status: 0 | 1 | 2 | 3 | 4; // 0 离线消息 1 服务端收到并转发出消息 2 接收者收到消息 未读 3 接收者收到消息 并已读 4 已删除
	sender: {
		userId: number;
		avatarUrl: string;
		nickName: string;
	};
	reciver: number; //接收者userId
	groupId?: number;
}

class Chat {
	static _instance: Chat
	private io: any
	private userList: IAnyObject

	static getInstance(server): Chat {
		if (!Chat._instance) {
			Chat._instance = new Chat(server)
		}
		return Chat._instance
	}

	constructor(server) {
		/** init一次 */
		this.userList = new Object()
		this.io = require('socket.io')(server)

		/** https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt */
		this.io.use(async (socket, next) => {
			if (socket.handshake.query && socket.handshake.query.token) {
				const realToken = await RedisStore.get(socket.handshake.query.token)
				jwt.verify(realToken, secretOrPrivateKey, function (err, decoded) {
					if (err) return next(new Error('Authentication error'))
					socket.decoded = decoded
					next()
				})
			} else {
				next(new Error('Authentication error'))
			}
		})

		this.io.on('connection', this.connection)

		this.io.on('error', (err) => {
			console.log(err)
		})
	}

	connection = (socket: any) => {
		METHODS.forEach(method => {
			socket.on(method, (data: any, callback: any) => {
				(this[method])(socket, data, callback)
			})
		})
	}

	send() {

	}

	invoke = (socket: any, data: any, callback: any) => {
		data = JSON.parse(data)
		const { type } = data

		switch (type) {
			case 'login':
				this.login(socket, data, callback)
				return
			case 'sendMsg':
				this.sendMsg(socket, data, callback)
				return
		}
	}

	login = (socket: any, data: any, callback: any) => {
		const { token, args } = data
		const { userId, socketId } = args

		this.userList[userId] = socketId

		callback({ code: 200, msg: 'login success' })

		/** 用户登录成功之后 将该用户的所有离线消息都推送过去 */
	}

	sendMsg = async (socket: any, data: any, callback: any) => {
		const args: Message = data.args
		const { reciver, sessionType } = args
		if (sessionType === 0) {
			/** 单聊 reciver为接收者的userId */
			if (this.userList[reciver]) {
				/** 接收者在线 */
				try {
					const msg: Message = {
						...args,
						time: new Date().getTime(),
						status: 1
					}
					callback({ code: 200, msg: 'success' })
					socket.to(this.userList[reciver]).emit('receiveMsg', msg)
					// await 
				} catch (err) {
					callback({ code: 400, msg: 'error' })
				}

			} else {
				/** 接收者离线 将消息放入该用户的离线消息list中 */
				const msg: Message = {
					...args,
					time: new Date().getTime(),
					status: 0
				}

			}

		} else if (sessionType === 1) {
			/** 群聊 reciver为接收的groupId */

		}
	}

	disconnect = (socket: any) => {
		/** 断开连接之后 将用户从在线user列表移除 */
		this.userList = _.omitBy(this.userList, (val) => val === socket.id)
	}


}


module.exports = Chat.getInstance

export { }
