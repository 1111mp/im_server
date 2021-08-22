import { ParameterizedContext, Next } from "koa";
import { FriendService } from "../services";

/**
 * @description friend controller
 * @class
 * @public
 */
export class FriendController {
  /**
   * @description create an instance of Friend controller
   * @constructor
   * @param friendService FriendService
   */
  public constructor(private friendService: FriendService) {}

  /**
   * @Post
   * @description add friend
   * @method {friend_add}
   * @param ctx ParameterizedContext
   * @param next Next
   * @returns
   */
  public friend_add = async (ctx: ParameterizedContext, next: Next) => {
    const { friendId, remark, ext } = <AddFriend>ctx.request.body;

    if (!friendId)
      return (ctx.body = {
        code: 400,
        msg: "The param of friendId cannot be empty.",
      });

    try {
      const is_friend = await this.friendService.is_friend(
        ctx.userId,
        friendId
      );

      if (is_friend)
        return (ctx.body = {
          code: 400,
          msg: "It's already a friend relationship, don't repeat submit.",
        });

      const sender = (
        await this.friendService.get_sender(ctx.userId)
      )?.toJSON() as UserAttributes;

      // send notify
      ctx.im.notify_send({
        type: NotifyType.FriendAdd,
        sender: sender,
        reciver: friendId,
        remark,
        ext,
      });

      return (ctx.body = {
        code: 200,
        msg: "Added successfully, please wait for confirmation from the other side.",
      });
    } catch (err) {
      return (ctx.body = {
        code: 500,
        data: `${err.name}: ${err.message}`,
      });
    }
  };

  /**
   * @Get
   * @description get all friend for user
   * @method {get_friends}
   * @param ctx ParameterizedContext
   * @param next Next
   */
  public get_friends = async (ctx: ParameterizedContext, next: Next) => {
    const { rows, count } = await this.friendService.find_and_count_all(
      ctx.userId
    );
  };
}
