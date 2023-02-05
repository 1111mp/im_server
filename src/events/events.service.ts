import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notify } from './models/notify.model';
import { CreateNotifyDto } from './dto/create-notify.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Notify)
    private readonly notifyModel: typeof Notify,
  ) {}

  public createNotify(notify: CreateNotifyDto) {
    return this.notifyModel.create(notify);
  }
}
