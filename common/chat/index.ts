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

class Chat {
	static _instance: Chat
	private io: any
	private userList: any[]

	static getInstance(server): Chat {
		if (!Chat._instance) {
			Chat._instance = new Chat(server)
		}
		return Chat._instance
	}

	constructor(server) {
		/** init一次 */
		this.userList = []
		this.io = require('socket.io')(server)

		this.io.on('connection', this.connection)
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
		}
	}

	login = (socket: any, data: any, callback: any) => {
		const { token, args } = data

		this.userList.push({ ...args })
		console.log(this.userList)

		callback({ code: 200, msg: 'login success' })
	}

	disconnect = (socket: any) => {
		/** 断开连接之后 将用户从在线user列表移除 */
		this.userList = this.userList.filter(user => user.socketId !== socket.id)
		console.log(this.userList)
	}


}


module.exports = Chat.getInstance