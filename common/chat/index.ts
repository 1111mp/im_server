const { secretOrPrivateKey } = require('config')
const jwt = require('jsonwebtoken')
const RedisStore = require('../middlewares/redis/redis')
const _ = require('lodash')

import { Message, IAnyObject, InvokeData } from '../const/interface'
import { getMsgList, pushOnlineMsg, pushOfflineMsg, delRedisKey, pushRedisRace } from './utils'

const METHODS: string[] = [
	'invoke',
	'disconnect'
]

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

	login = async (socket: any, data: any, callback: any) => {
		const { args } = data
		const { userId, socketId } = args

		this.userList[userId] = {
			...this.userList[userId],
			socketId,
			socket
		}

		callback({ code: 200, msg: 'login success' })

		/** 用户登录成功之后 将该用户的所有离线消息都推送过去 */
		let offlineMsgs = await getMsgList(true, userId)

		if (offlineMsgs && offlineMsgs.length) {
			/** 有离线消息 一次性推送给客户端 */
			await socket.emit('offlineMsgs', offlineMsgs, data => {
				console.log(data.lastMsgId)
				if (data && data.code === 200) {
					// delRedisKey(`offline::${userId}`)
				}
			})
		}
	}

	sendMsg = async (socket: any, data: any, callback: any) => {
		const args: Message = data.args
		const { sessionType } = args
		if (sessionType === 0) {
			const { reciver, sender } = args
			let msg: Message = {
				...args,
				time: new Date().getTime()
			}

			/** 单聊 reciver为接收者的userId */
			if (this.userList[reciver]) {
				/** 接收者在线 */
				callback({ code: 200, msg: 'success' })
				try {
					msg = {
						...msg,
						status: 1
					}

					let promise = new Promise((resolve, reject) => {
						this.userList[reciver].socket.emit('receiveMsg', msg, data => {
							resolve(data)
						})
					})
					let res = await pushRedisRace(promise)

					if (res.code === 200) {
						msg = {
							...msg,
							status: 2
						}
						/** 将msg push到redis消息列表中 */
						await pushOnlineMsg(sender.userId, reciver, msg)
					} else {
						/** 将msg push到redis消息列表中 */
						await pushOnlineMsg(sender.userId, reciver, msg)
					}

				} catch (err) {
					console.log(err)
				}

			} else {
				/** 接收者离线 将消息放入该用户的离线消息list中 */
				msg = {
					...msg,
					status: 0
				}

				/** 将离线消息push到user的离线消息列表中去 */
				// pushMsgToredisList(sender.userId, reciver, msg)
				console.log(reciver)
				let res = await pushOfflineMsg(sender.userId, reciver, msg)
				console.log(res)
				if (res === 'successed') {
					callback({ code: 200, msg: 'success' })
				} else {
					callback({ code: 500, msg: 'push msg to redis error' })
				}
			}

		} else if (sessionType === 1) {
			/** 群聊 reciver为接收的groupId */

		}
	}

	sendNotify = (userId, notify: IAnyObject) => {
		if (this.userList[userId]) {
			/** 在线 */
			this.userList[userId].socket.emit('notify', notify, data => {
				console.log(data)
			})
		} else {
			/** 离线 */
		}

	}

	disconnect = (socket: any) => {
		/** 断开连接之后 将用户从在线user列表移除 */
		this.userList = _.omitBy(this.userList, (val) => val.socketId === socket.id)
	}


}


module.exports = function (server) {
	(global as any).ChatInstance = Chat.getInstance(server)
}

export { }
