import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';

import { Notify } from './models/notify.model';
import { Message as MessageModel } from './models/message.model';
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
    @InjectQueue(IMQueueName) private readonly imQueue: Queue,
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
   * @description: update notify status
   * @param {string} id
   * @param {ModuleIM} status
   * @return {Promise<[affectedCount:number]>}
   */
  public updateNotifyStatus(id: string, status: ModuleIM.Common.NotifyStatus) {
    return this.notifyModel.update({ status }, { where: { id } });
  }

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

    return this.messageModel.create({ ...message, sender: sender.id, content });
  }
}
