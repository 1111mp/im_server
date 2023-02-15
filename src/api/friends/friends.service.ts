import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 } from 'uuid';
import { Friend } from './models/friend.model';
import { FriendSetting } from './models/friend-setting.model';
import { EventsService } from 'src/events/events.service';
import {
  AgreeOrRejectDto,
  CreateFriendDto,
  UpdateFriendDto,
} from './dto/create-friend-dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friend)
    private readonly friendModel: typeof Friend,
    @InjectModel(FriendSetting)
    private readonly friendSettingModel: typeof FriendSetting,
    private readonly eventsService: EventsService,
  ) {}

  public async addOne(
    sender: User.UserInfo,
    createFriendDto: CreateFriendDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    try {
      const { id: userId } = sender;
      const { userId: friendId, remark, ext } = createFriendDto;

      const relation = await this.getFriendRelation(userId, friendId);

      if (relation) {
        throw new ForbiddenException(
          "It's already a friend relationship, don't repeat submit.",
        );
      }

      const notify: ModuleIM.Core.Notify = {
        id: v4(),
        type: ModuleIM.Common.Notifys.AddFriend,
        sender,
        receiver: friendId,
        status: ModuleIM.Common.NotifyStatus.Initial,
        timer: `${Date.now()}`,
        remark,
        ext,
      };

      await this.eventsService.createNotify({ ...notify, sender: userId });

      // add a send notify task to Queue
      await this.eventsService.addNotifyTaskToQueue(notify);

      return {
        statusCode: HttpStatus.OK,
        message: 'Seccessed, wait for the other party to agree.',
      };
    } catch (err) {
      throw new InternalServerErrorException('Database error.');
    }
  }

  /**
   * @description: delete one friend
   * @param friendId number
   * @param user User.UserInfo
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async deleteOne(
    friendId: number,
    user: User.UserInfo,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { id: userId } = user;
    const relation = await this.getFriendRelation(userId, friendId);

    if (!relation) {
      throw new ForbiddenException('Not yet a friendship.');
    }

    const trans = await this.friendModel.sequelize.transaction();
    try {
      await this.friendSettingModel.destroy({
        where: {
          [Op.or]: [
            {
              userId,
              friendId,
            },
            {
              userId: friendId,
              friendId: userId,
            },
          ],
        },
        transaction: trans,
      });

      await this.friendModel.destroy({
        where: {
          [Op.or]: [
            {
              userId,
              friendId,
            },
            {
              userId: friendId,
              friendId: userId,
            },
          ],
        },
        transaction: trans,
      });

      const notify: ModuleIM.Core.Notify = {
        id: v4(),
        type: ModuleIM.Common.Notifys.DelFriend,
        sender: user,
        receiver: friendId,
        status: ModuleIM.Common.NotifyStatus.Initial,
        timer: `${Date.now()}`,
      };

      await this.eventsService.createNotify(
        { ...notify, sender: userId },
        trans,
      );

      await trans.commit();

      // Successfully deleted & send a delete friend notity task to IMQueue
      await this.eventsService.addNotifyTaskToQueue(notify);

      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully deleted.',
      };
    } catch (err) {
      await trans.rollback();
      throw new InternalServerErrorException('Database Error.');
    }
  }

  /**
   * @description: Get whether the user is a friend
   * @param userId number
   * @param friendId number
   * @param updateFriendDto UpdateFriendDto
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async updateOne(
    userId: number,
    friendId: number,
    updateFriendDto: UpdateFriendDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { remark, astrolabe, block } = updateFriendDto;

    if (!remark && !astrolabe && !block) {
      throw new BadRequestException();
    }

    const [count] = await this.friendSettingModel.update(
      { remark, astrolabe, block },
      { where: { userId, friendId } },
    );

    if (count === 1) {
      return { statusCode: HttpStatus.OK, message: 'Successfully updated.' };
    } else if (count === 0) {
      throw new NotFoundException('No resources are updated.');
    } else {
      throw new InternalServerErrorException('Database error.');
    }
  }

  /**
   * @description: Get one friend setting info
   * @param userId number
   * @param friendId number
   * @return Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async getOne(
    userId: number,
    friendId: number,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    try {
      const setting = await this.friendSettingModel.findOne({
        where: {
          userId,
          friendId,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        data: setting.toJSON(),
      };
    } catch (err) {
      throw new InternalServerErrorException('Database Error.');
    }
  }

  /**
   * @description: Get user all friend, not include friend setting info
   * @param userId number
   * @return Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async getAll(
    userId: number,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    try {
      const { rows: friends, count } = await this.friendModel.findAndCountAll({
        where: {
          [Op.or]: [{ userId }, { friendId: userId }],
        },
      });

      const friendsInfo = await Promise.all(
        friends.map(async (friend) =>
          (
            await friend.$get(
              userId === friend.userId ? 'infoFromFriend' : 'infoFromUser',
              {
                attributes: { exclude: ['pwd'] },
              },
            )
          ).toJSON(),
        ),
      );

      return {
        statusCode: HttpStatus.OK,
        data: {
          count,
          friends: friendsInfo,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('Database Error.');
    }
  }

  /**
   * @description: Agree to add yourself as a friend
   * @param user User.UserInfo
   * @param agreeDto AgreeOrRejectDto
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async handleAgree(
    user: User.UserInfo,
    agreeDto: AgreeOrRejectDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { notifyId } = agreeDto;

    const notify = await this.eventsService.findNotifyById(notifyId);
    if (
      !notify ||
      notify.status === ModuleIM.Common.NotifyStatus.Fulfilled ||
      notify.status === ModuleIM.Common.NotifyStatus.Rejected
    ) {
      throw new NotFoundException('Request has expired.');
    }

    const relation = await this.getFriendRelation(user.id, notify.sender);
    if (relation) {
      throw new ForbiddenException(
        "It's already a friend relationship, don't repeat submit.",
      );
    }

    const trans = await this.friendModel.sequelize.transaction();

    try {
      const [count] = await this.eventsService.updateNotifyStatus(
        notifyId,
        ModuleIM.Common.NotifyStatus.Fulfilled,
        trans,
      );

      if (count !== 1) {
        throw new InternalServerErrorException();
      }

      const { sender } = notify;

      await this.friendModel.create(
        { userId: user.id, friendId: sender },
        { transaction: trans },
      );

      await Promise.all([
        this.friendSettingModel.create(
          {
            userId: user.id,
            friendId: sender,
          },
          { transaction: trans },
        ),
        this.friendSettingModel.create(
          {
            userId: sender,
            friendId: user.id,
          },
          { transaction: trans },
        ),
      ]);

      await trans.commit();

      await this.eventsService.addNotifyTaskToQueue({
        ...notify.toJSON(),
        receiver: sender,
        sender: user,
        status: ModuleIM.Common.NotifyStatus.Fulfilled,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      };
    } catch (err) {
      await trans.rollback();

      throw new InternalServerErrorException('Database Error.');
    }
  }

  /**
   * @description: Reject to add yourself as a friend
   * @param user User.UserInfo
   * @param rejectDto AgreeOrRejectDto
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async handleReject(
    user: User.UserInfo,
    rejectDto: AgreeOrRejectDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { notifyId } = rejectDto;

    const notify = await this.eventsService.findNotifyById(notifyId);
    if (
      !notify ||
      notify.status === ModuleIM.Common.NotifyStatus.Fulfilled ||
      notify.status === ModuleIM.Common.NotifyStatus.Rejected
    ) {
      throw new NotFoundException('Request has expired.');
    }

    const relation = await this.getFriendRelation(user.id, notify.sender);
    if (relation) {
      throw new ForbiddenException(
        "It's already a friend relationship, don't repeat submit.",
      );
    }

    const trans = await this.friendModel.sequelize.transaction();

    try {
      const [count] = await this.eventsService.updateNotifyStatus(
        notifyId,
        ModuleIM.Common.NotifyStatus.Rejected,
        trans,
      );

      if (count !== 1) {
        throw new InternalServerErrorException();
      }

      await trans.commit();

      await this.eventsService.addNotifyTaskToQueue({
        ...notify.toJSON(),
        receiver: notify.sender,
        sender: user,
        status: ModuleIM.Common.NotifyStatus.Rejected,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      };
    } catch (err) {
      await trans.rollback();

      throw new InternalServerErrorException('Database Error.');
    }
  }

  /**
   * @description: Get whether the user is a friend
   * @param userId number
   * @param friendId number
   * @returns Promise<boolean>
   */
  private async getFriendRelation(userId: number, friendId: number) {
    const count = await this.friendModel.count({
      where: {
        [Op.or]: [
          {
            userId,
            friendId,
          },
          {
            userId: friendId,
            friendId: userId,
          },
        ],
      },
    });

    return !!count;
  }
}
