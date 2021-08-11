import { Next, ParameterizedContext } from "koa";
import { GroupCreator } from "../types/types";
import { IMService } from "../services";

/**
 * @description IM controller
 * @class
 * @public
 */
export class IMController {
  /**
   * @description Creates an instance of im controller
   * @constructor
   * @param imService	IMService
   */
  public constructor(private imService: IMService) {}

  /**
   * @Post
   * @method {create_group}
   * @param ctx ParameterizedContext<{}, { userId: number }>
   * @param next Next
   * @returns {Promise<BaseResponse>}
   */
  public create_group = async (
    ctx: ParameterizedContext<{}, { userId: number }>,
    next: Next
  ) => {
    const { type, avatar, name, members } = <GroupCreator>ctx.request.body;

    if (!type || !(type in [1, 2]) || !members || !members.length)
      return (ctx.body = {
        code: 400,
        msg: "Invalid parameter.",
      });

    try {
      const { group, members: group_members } =
        await this.imService.create_group({
          type,
          avatar,
          name,
          members,
          creator: ctx.userId,
        });

      return (ctx.body = {
        code: 200,
        data: {
          ...group,
          members: group_members,
        },
      });
    } catch (err) {
      return (ctx.body = {
        code: 500,
        msg: `${err.name}: ${err.message}`,
      });
    }
  };

  /**
   * @Get
   * @method {getGroupInfoById}
   * @param ctx	ParameterizedContext
   * @param next Next
   * @returns	{Promise<BaseResponse>}
   */
  public getGroupInfoById = async (ctx: ParameterizedContext, next: Next) => {
    const { id } = <{ id: string }>ctx.query;

    if (!id)
      return (ctx.body = {
        code: 400,
        msg: "The param of id cannot be empty.",
      });

    try {
      const { group, members } = await this.imService.getGroupInfoById(
        Number(id)
      );

      if (!group)
        return (ctx.body = { code: 403, msg: "The group does not exist." });

      return (ctx.body = {
        code: 200,
        data: {
          ...group.toJSON(),
          members,
        },
      });
    } catch (err) {
      return (ctx.body = {
        code: 500,
        msg: `${err.name}: ${err.message}`,
      });
    }
  };
}