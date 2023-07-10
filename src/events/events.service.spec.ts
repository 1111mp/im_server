import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { getQueueToken } from '@nestjs/bull';
import { EventsService } from './events.service';
import { Notify } from './models/notify.model';
import { Message as MessageModel } from './models/message.model';
import { MessageAck as MessageAckModel } from './models/message-ack.model';
import { MessageRead as MessageReadModel } from './models/message-read.model';
import { IMQueueName } from './constants';
import { GroupsService } from 'src/api/groups/groups.service';

import type { Queue } from 'bull';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => 'uploads/'),
          },
        },
        { provide: getModelToken(Notify), useValue: {} },
        { provide: getModelToken(MessageModel), useValue: {} },
        { provide: getModelToken(MessageAckModel), useValue: {} },
        { provide: getModelToken(MessageReadModel), useValue: {} },
        { provide: getQueueToken(IMQueueName), useValue: {} },
        { provide: GroupsService, useValue: {} },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
