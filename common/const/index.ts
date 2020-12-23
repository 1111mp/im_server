export const STARREDISKEY = "starRedis";

export const STARRCOUNTKEY = "starCounts";

export const STARLOCK = "starLock";

export const USERAUTHKEY = "user_auth";

/** 用户信息的key */
export const USERINFOKEY = "user_info";
/** 通知消息的key */
export const NOTIFYKEY = "key_notify";
/** 离线通知消息的key */
export const NOTIFYOFFLINEKEY = "key_notify_offline";

export function getNotifyKey(userId: number, offline: boolean = false): string {
  return `${offline ? NOTIFYOFFLINEKEY : NOTIFYKEY}::${userId}`;
}
