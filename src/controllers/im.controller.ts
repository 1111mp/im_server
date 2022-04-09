import { Next, ParameterizedContext } from "koa";
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
  public create_group = async (ctx: ParameterizedContext, next: Next) => {
    const { type, avatar, name, members } = <ModuleIM.Params.GroupCreator>(
      ctx.request.body
    );

    if (!type || !(type in [1, 2]) || !members || !members.length)
      return (ctx.body = {
        code: Response.StatusCode.BadRequest,
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
        code: Response.StatusCode.Success,
        data: {
          ...group,
          members: group_members,
        },
      });
    } catch (err) {
      return (ctx.body = {
        code: Response.StatusCode.ServerError,
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
        code: Response.StatusCode.BadRequest,
        msg: "The param of id cannot be empty.",
      });

    try {
      const { group, members } = await this.imService.getGroupInfoById(
        Number(id)
      );

      if (!group)
        return (ctx.body = { code: 403, msg: "The group does not exist." });

      return (ctx.body = {
        code: Response.StatusCode.Success,
        data: {
          ...group.toJSON(),
          members,
        },
      });
    } catch (err) {
      return (ctx.body = {
        code: Response.StatusCode.ServerError,
        msg: `${err.name}: ${err.message}`,
      });
    }
  };
}
