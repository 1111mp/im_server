/**
 * 消息的缓存机制
 * 存入redis中 定时把redis中聊天记录同步到数据库中
 * 单聊
 * key `${sender}::${reciver}`	value 消息list
 *
 * 群聊消息其实也只需要往用户的消息list中push 因为群聊的消息 服务端转发的时候会遍历成员 将消息发送给每个成员
 *
 * 消息list 通过sessionType区分单聊群聊
 * 
 * redis详解： https://blog.csdn.net/helencoder/article/details/51784654
 */

const RedisStore = require('../middlewares/redis/redis')

class Message {
	static _instance: Message
	private key: string;
	msgList: any[]
	redis: any;

	static getInstance(userId) {
		if (!this._instance) {
			this._instance = new Message(userId)
		}
		return this._instance
	}

	constructor(userId) {
		this.key = `msgs::${userId}`
		this.redis = RedisStore.redis
		this.initMsg()
	}

	/** 初始化 读取redis中的消息列表 减少redis读取操作 */
	initMsg = async () => {
		this.msgList = await this.redis.lrange(this.key, 0, -1)
		console.log(this.msgList)
	}

	/** 将一条消息push到消息list中 */
	pushMsg = (msg) => {
		this.msgList.push(msg)
	}

	/** 将msgList同步到redis中 */
	syncMsgToRedis = () => {

	}

}

module.exports = function (userId) {
	return Message.getInstance(userId)
}

export { }
