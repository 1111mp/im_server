# 介绍

    聊天消息不可能都实时写入到数据库中 代价太高 所以服务端的策略是先将数据写入到redis中 然后使用定时任务 每隔2小时同步一次redis数据到数据库 跟点赞的实现方式一致
    本来是想通过定时任务把redis的聊天数据同步到数据库 但是代价也是有点高 所以在用户断开连接的时候去同步

## 单聊

    redis中两个list去维护聊天消息：
    	1、A用户和B用户共同的一个msgList redis的key的规则为 `to::${reciver}`
    	2、A用户或者B用户的离线消息list redis的key的规则为 `offline::${reciver}`

redis 离线消息储存格式：

```
{
	sender1: [...msgs],
	sender2: [...msgs],
	...
}
```

    比如：
    	1、A用户和B用户聊天，且同时都在线，那么A给B发送了一个msg，服务端在收到A发出的msg之后，会将msg push到A用户和B用户共同的msgList中（key有两种可能：`${sender}::${reciver}` or `${reciver}::${sender}`，所以在存取的时候需要判断），然后执行A发送消息成功的回调并把消息推送给B
    	2、A用户在线B离线，当A给B发送了一个msg，服务端在收到A发出的msg之后，会将msg push到A用户和B用户共同的msgList中并同时也push到用户B的离线消息列表中，然后执行A发送消息成功的回调，反之亦然
    	3、此时离线的用户B的list中保存了A发送的一条msg，所以当用户B上线时，查找redis中B的离线消息list，然后将list推送给B，然后清空用户B的离线消息list

    获取历史记录时，应该先查redis中A和B的共同的msgList，然后再从数据库中查
