import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';

import { Notify } from './models/notify.model';
import { Message as MessageModel } from './models/message.model';
import { MessageRead as MessageReadModel } from './models/message-read.model';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { IMQueueName } from './constants';

import type { Queue } from 'bull';
import type { Transaction } from 'sequelize';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Notify)
    private readonly notifyModel: typeof Notify,
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
    @InjectModel(MessageReadModel)
    private readonly messageReadModel: typeof MessageReadModel,
    @InjectQueue(IMQueueName) private readonly imQueue: Queue<unknown>,
  ) {}

  public createNotify(notify: CreateNotifyDto, trans: Transaction = null) {
    return this.notifyModel.create(notify, { transaction: trans });
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
   * @description: Add a send message:all task to IMQueue
   * @param ModuleIM.Core.MessageAll
   * @returns Promise<void>
   */
  public addMessageTaskToQueue(message: ModuleIM.Core.MessageAll) {
    return this.imQueue.add('send-message:all', message);
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
  public updateNotifyStatus(id: string, status: ModuleIM.Common.NotifyStatus) {
    return this.notifyModel.update({ status }, { where: { id } });
  }

  /**
   * @description: Create one Message
   * @param message ModuleIM.Core.MessageAll
   * @returns Promise<MessageModel>
   */
  public createOneForMessage(message: ModuleIM.Core.MessageAll) {
    const { sender, type } = message;
    let content = '';
    switch (type) {
      case ModuleIM.Common.MsgType.Text: {
        content = message.text;
        break;
      }
      case ModuleIM.Common.MsgType.Image: {
        content = message.image;
        break;
      }
      default:
        break;
    }

    return this.messageModel.create({
      ...message,
      sender: sender.id,
      status: ModuleIM.Common.MsgStatus.Initial,
      content,
    });
  }

  /**
   * @description: Update message status
   * @param id string
   * @param status ModuleIM.Common.MsgStatus
   * @returns Promise<[affectedCount: number]>
   */
  public updateMessageStatus(id: string, status: ModuleIM.Common.MsgStatus) {
    return this.messageModel.update({ status }, { where: { id } });
  }

  /**
   * @description: Update message:read status
   * @param id string
   * @param status ModuleIM.Common.MsgStatus
   * @returns Promise<[affectedCount: number]>
   */
  public updateMessageReadStatus(
    id: string,
    status: ModuleIM.Common.MsgStatus,
  ) {
    return this.messageReadModel.update({ status }, { where: { id } });
  }

  public async handleForMessageRead(
    message: ModuleIM.Core.MessageRead,
  ): Promise<[affectedCount: number]> {
    const trans = await this.messageReadModel.sequelize.transaction();
    let result: [affectedCount: number];
    try {
      await this.messageReadModel.create(
        { ...message, status: ModuleIM.Common.MsgStatus.Initial },
        { transaction: trans },
      );

      result = await this.messageModel.update(
        { status: ModuleIM.Common.MsgStatus.Readed },
        { where: { id: message.id }, transaction: trans },
      );

      await trans.commit();

      return result;
    } catch (err) {
      await trans.rollback();
      return [0];
    }
  }
}
