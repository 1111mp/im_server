import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';

import { Notify } from './models/notify.model';
import { CreateNotifyDto } from './dto/create-notify.dto';

import { IMQueueName } from './constants';
import type { Queue } from 'bull';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Notify)
    private readonly notifyModel: typeof Notify,
    @InjectQueue(IMQueueName) private readonly imQueue: Queue,
  ) {}

  public createNotify(notify: CreateNotifyDto) {
    return this.notifyModel.create(notify);
  }

  public async addNotifyTaskToQueue(notify: ModuleIM.Core.Notify) {
    await this.imQueue.add('send-notify', notify);
  }
}
