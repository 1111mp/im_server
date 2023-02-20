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
import { Message as MessageModel } from './models/message.model';
import { MessageExt as MessageExtModel } from './models/message-ext.model';
import { MessageRead as MessageReadModel } from './models/message-read.model';
import {
  CreateNotifyDto,
  updateNotifyStatusDto,
} from './dto/create-notify.dto';
import { IMQueueName } from './constants';

import type { Queue } from 'bull';
import { Transaction, where } from 'sequelize';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Notify)
    private readonly notifyModel: typeof Notify,
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
    @InjectModel(MessageExtModel)
    private readonly messageExtModel: typeof MessageExtModel,
    @InjectModel(MessageReadModel)
    private readonly messageReadModel: typeof MessageReadModel,
    @InjectQueue(IMQueueName) private readonly imQueue: Queue<unknown>,
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
   * @description: Update message status
   * @param info { sender: number; receiver: number; lastAck: bigint; }
   * @returns Promise<[MessageExtModel, boolean]>
   */
  public updateAckMessage({
    sender,
    receiver,
    lastAck,
  }: {
    sender: number;
    receiver: number;
    lastAck: bigint;
  }) {
    return this.messageExtModel.upsert(
      { sender, receiver, lastAck },
      { fields: ['lastAck'] },
    );
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
  ): Promise<[MessageExtModel, boolean]> {
    const { id, ...other } = message;

    return this.messageExtModel.upsert(
      { ...other, lastRead: id },
      { fields: ['lastRead'] },
    );
  }
}
