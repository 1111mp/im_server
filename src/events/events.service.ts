import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { validate } from 'class-validator';

import { Notify } from './models/notify.model';
import { GroupsService } from 'src/api/groups/groups.service';
import { Message as MessageModel } from './models/message.model';
import { MessageAck as MessageAckModel } from './models/message-ack.model';
import { MessageRead as MessageReadModel } from './models/message-read.model';
import { User as UserModel } from 'src/api/users/models/user.model';
import {
  CreateNotifyDto,
  updateNotifyStatusDto,
} from './dto/create-notify.dto';
import { GetOfflineMsgsDto, MsgReceivedDto } from './dto/create-message.dto';
import { IMQueueName } from './constants';
import { CacheFnResult } from 'src/common/cache/decotators/cache-fn.decorator';
import { Op, Transaction } from 'sequelize';

import type { Queue } from 'bull';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Notify)
    private readonly notifyModel: typeof Notify,
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
    @InjectModel(MessageAckModel)
    private readonly messageAckModel: typeof MessageAckModel,
    @InjectModel(MessageReadModel)
    private readonly messageReadModel: typeof MessageReadModel,
    @InjectQueue(IMQueueName) private readonly imQueue: Queue<unknown>,
    private readonly groupService: GroupsService,
  ) {}

  public createNotify(notify: CreateNotifyDto, trans: Transaction = null) {
    return this.notifyModel.create(notify, { transaction: trans });
  }

  public findNotifyById(id: string) {
    return this.notifyModel.findOne({ where: { id } });
  }

  /**
   * @description: Add a send notify task to IMQueue
   * @param ModuleIM.Core.Notify
   * @returns Promise<void>
   */
  public addNotifyTaskToQueue(notify: ModuleIM.Core.Notify) {
    return this.imQueue.add('send-notify', notify);
  }

  /**
   * @description: Get user all offline notifys
   * @param userId number
   * @return Promise<IMServerResponse.JsonResponse<ModuleIM.Core.Notify[]> & { count: number }>
   */
  public async getOfflineNotify(
    userId: number,
  ): Promise<
    IMServerResponse.JsonResponse<ModuleIM.Core.Notify[]> & { count: number }
  > {
    try {
      const { rows, count } = await this.notifyModel.findAndCountAll({
        where: {
          receiver: userId,
          status: ModuleIM.Common.NotifyStatus.Initial,
        },
      });

      const notifys = await Promise.all(
        rows.map(async (notify) => {
          const info = await notify.$get('senderInfo', {
            attributes: { exclude: ['pwd'] },
          });

          return {
            ...notify.toJSON(),
            sender: info.toJSON(),
          };
        }),
      );

      return {
        statusCode: HttpStatus.OK,
        count,
        data: notifys,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `[Database error] ${err.name}: ${err.message}`,
      );
    }
  }

  /**
   * @description: Notify received
   * @param receivedNotifyDto: updateNotifyStatusDto,
   * @return Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async receivedNotify(
    receivedNotifyDto: updateNotifyStatusDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const errors = await validate(receivedNotifyDto);
    if (errors.length) {
      throw new BadRequestException('Incorrect request parameter.');
    }

    const notify = await this.notifyModel.findOne({
      where: { id: receivedNotifyDto.notifyId },
    });

    if (!notify || notify.status !== ModuleIM.Common.NotifyStatus.Initial) {
      throw new NotFoundException('Request has expired.');
    }

    const [count] = await this.updateNotifyStatus(
      receivedNotifyDto.notifyId,
      ModuleIM.Common.NotifyStatus.Received,
    );

    if (count === 1) {
      return { statusCode: HttpStatus.OK, message: 'Successfully.' };
    } else if (count === 0) {
      throw new NotFoundException('No resources are updated.');
    } else {
      throw new InternalServerErrorException('Database error.');
    }
  }

  /**
   * @description: Notify Readed
   * @param receivedNotifyDto: updateNotifyStatusDto,
   * @return Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async readedNotify(
    readedNotifyDto: updateNotifyStatusDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const errors = await validate(readedNotifyDto);
    if (errors.length) {
      throw new BadRequestException('Incorrect request parameter.');
    }

    const notify = await this.notifyModel.findOne({
      where: { id: readedNotifyDto.notifyId },
    });

    if (!notify || notify.status !== ModuleIM.Common.NotifyStatus.Received) {
      throw new NotFoundException('Request has expired.');
    }

    const [count] = await this.updateNotifyStatus(
      readedNotifyDto.notifyId,
      ModuleIM.Common.NotifyStatus.Readed,
    );

    if (count === 1) {
      return { statusCode: HttpStatus.OK, message: 'Successfully.' };
    } else if (count === 0) {
      throw new NotFoundException('No resources are updated.');
    } else {
      throw new InternalServerErrorException('Database error.');
    }
  }

  /**
   * @description: Get user all offline messages
   * @param userId number
   * @param getOfflineMsgsDto GetOfflineMsgsDto,
   * @return Promise<IMServerResponse.JsonResponse<unknown> & { count: number }>
   */
  public async getOfflineMsgs(
    userId: number,
    getOfflineMsgsDto: GetOfflineMsgsDto,
  ): Promise<IMServerResponse.JsonResponse<unknown> & { count: number }> {
    const { currentPage, pageSize } = getOfflineMsgsDto;

    try {
      const { lastAck = 0 } = (await this.getLastAck(userId)) || {};
      const userGroups = await UserModel.build({ id: userId }).$get('groups', {
        raw: true,
        attributes: ['id'],
        // @ts-ignore
        joinTableAttributes: [],
      });

      const { rows, count } = await this.messageModel.findAndCountAll({
        raw: true,
        where: {
          id: {
            [Op.gt]: lastAck,
          },
          [Op.or]: [
            { receiver: userId },
            {
              groupId: userGroups.map(({ id }) => id),
            },
          ],
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      });

      return {
        statusCode: HttpStatus.OK,
        count,
        data: rows,
      };
    } catch (err) {
      throw new InternalServerErrorException('Database error.');
    }
  }

  /**
   * @description: messsage received
   * @param userId number,
   * @param msgReceivedDto MsgReceivedDto,
   * @return Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async msgReceived(
    userId: number,
    msgReceivedDto: MsgReceivedDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { id } = msgReceivedDto;

    try {
      await this.upsertLastAck({
        receiver: userId,
        lastAck: id,
        lastAckErr: null,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `[Database error] ${err.name}: ${err.message}`,
      );
    }
  }

  /**
   * @description: Add a send message:all task to IMQueue
   * @param ModuleIM.Core.MessageAll
   * @returns Promise<void>
   */
  public addMessageTaskToQueue(message: ModuleIM.Core.MessageBasic) {
    return this.imQueue.add('send-message', message);
  }

  /**
   * @description: Add a send message:read task to IMQueue
   * @param ModuleIM.Core.MessageRead
   * @returns Promise<void>
   */
  public addMessageReadTaskToQueue(message: ModuleIM.Core.MessageRead) {
    return this.imQueue.add('send-message:read', message);
  }

  /**
   * @description: update notify status
   * @param {string} id
   * @param {ModuleIM} status
   * @return {Promise<[affectedCount:number]>}
   */
  public updateNotifyStatus(
    id: string,
    status: ModuleIM.Common.NotifyStatus,
    trans?: Transaction,
  ) {
    return this.notifyModel.update(
      { status },
      { where: { id }, transaction: trans },
    );
  }

  /**
   * @description: Create one Message
   * @param message ModuleIM.Core.MessageAll
   * @returns Promise<MessageModel>
   */
  public createOneForMessage(message: ModuleIM.Core.MessageBasic) {
    const { sender } = message;

    return this.messageModel.create({
      ...message,
      sender: sender.id,
    });
  }

  /**
   * @description: get group members
   * @param groupId number
   * @return Promise<User[]>
   */
  @CacheFnResult()
  public getGroupMembersById(groupId: number) {
    return this.groupService.getGroupMembersById(groupId);
  }

  /**
   * @description: get last ack info
   * @param receiver  number
   * @return Promise<MessageAckModel>
   */
  public getLastAck(receiver: number, trans?: Transaction) {
    return this.messageAckModel.findOne({
      raw: true,
      where: {
        receiver,
      },
      transaction: trans,
    });
  }

  /**
   * @description: update or insert message MessageAckModel
   * @param value { receiver: number; lastAck: bigint; lastAckErr: bigint; }
   * @return Promise<[MessageAckModel, boolean]>
   */
  public upsertLastAck({
    receiver,
    lastAck,
    lastAckErr,
  }: {
    receiver: number;
    lastAck: bigint;
    lastAckErr: bigint;
  }) {
    return this.messageAckModel.upsert(
      { receiver, lastAck, lastAckErr },
      { fields: ['lastAck', 'lastAckErr'] },
    );
  }

  /**
   * @description: update or insert message MessageReadModel
   * @param message ModuleIM.Core.MessageRead
   * @return Promise<[instance:MessageReadModel, affectedCount:number]>
   */
  public async upsertLastRead(
    message: ModuleIM.Core.MessageRead,
  ): Promise<[instance: MessageReadModel, affectedCount: number]> {
    const { id, groupId, sender, receiver } = message;
    const where = { sender: groupId !== void 0 ? groupId : sender, receiver };

    const exist = await this.messageReadModel.count({
      where,
    });

    let instance: MessageReadModel, count: number;
    if (exist) {
      // update
      const result = await this.messageReadModel.update(
        { lastRead: id },
        { where },
      );
      count = result[0];
    } else {
      // insert
      instance = await this.messageReadModel.create({
        ...where,
        lastRead: id,
      });
    }

    return [instance, count];
  }
}
