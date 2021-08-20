import { FriendService } from "../services";
import { ParameterizedContext, Next } from "koa";

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

  public friend_add = async (ctx: ParameterizedContext, next: Next) => {
    const { friendId, remark, ext } = <AddFriend>ctx.request.body;

    if (!friendId)
      return (ctx.body = {
        code: 400,
        msg: "The param of friendId cannot be empty.",
      });

    const is_friend = await this.friendService.is_friend(ctx.userId, friendId);

    if (is_friend)
      return (ctx.body = {
        code: 400,
        msg: "It's already a good friend relationship, don't repeat submit.",
      });

    // send notify
  };

  public get_friends = async (ctx: ParameterizedContext, next: Next) => {
    const { rows, count } = await this.friendService.find_and_count_all(
      ctx.userId
    );
  };
}
