import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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

const notify = {
  id: '0504339d-b2b6-48c9-a422-308163c8e8fc',
  type: 1,
  sender: 10007,
  receiver: 10009,
  status: 1,
  timer: 1689150835266,
};

describe('EventsService', () => {
  let service: EventsService,
    notifyModel: typeof Notify,
    imQueue: Queue<unknown>;

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
        {
          provide: getModelToken(Notify),
          useValue: {
            create: jest.fn(() => notify),
            findOne: jest.fn(() => notify),
            findAndCountAll: jest.fn(() => ({ rows: [], count: 0 })),
          },
        },
        {
          provide: getModelToken(MessageModel),
          useValue: {
            findAndCountAll: jest.fn(() => ({ rows: [], count: 0 })),
          },
        },
        {
          provide: getModelToken(MessageAckModel),
          useValue: {
            findOne: jest.fn(() => ({ lastAck: 1 })),
            upsert: jest.fn(),
          },
        },
        {
          provide: getModelToken(MessageReadModel),
          useValue: {},
        },
        {
          provide: getQueueToken(IMQueueName),
          useValue: {
            add: jest.fn(),
          },
        },
        { provide: GroupsService, useValue: {} },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    notifyModel = module.get<typeof Notify>(getModelToken(Notify));
    imQueue = module.get<Queue<unknown>>(getQueueToken(IMQueueName));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotify', () => {
    it('should create a notify', () => {
      expect(service.createNotify(notify, null)).toEqual(notify);
      expect(notifyModel.create).toBeCalledTimes(1);
      expect(notifyModel.create).toBeCalledWith(notify, { transaction: null });
    });
  });

  describe('findNotifyById', () => {
    it('should get a notify by id', async () => {
      expect(service.findNotifyById('id')).toEqual(notify);
      expect(notifyModel.findOne).toBeCalledTimes(1);
      expect(notifyModel.findOne).toBeCalledWith({ where: { id: 'id' } });
    });
  });

  describe('addNotifyTaskToQueue', () => {
    it('should add a notify to quene', () => {
      expect(
        service.addNotifyTaskToQueue(notify as unknown as ModuleIM.Core.Notify),
      );
      expect(imQueue.add).toBeCalledTimes(1);
      expect(imQueue.add).toBeCalledWith('send-notify', notify);
    });
  });

  describe('getOfflineNotifys', () => {
    it('should get all notifys & count', () => {
      expect(service.getOfflineNotifys(10007)).resolves.toEqual({
        rows: [],
        count: 0,
      });
      expect(notifyModel.findAndCountAll).toBeCalledTimes(1);
    });
  });

  describe('notifyReceived', () => {
    it("should update notify's status to received", async () => {
      const updateStub = jest.fn();
      const findSpy = jest.spyOn(notifyModel, 'findOne').mockReturnValue({
        update: updateStub,
      } as any);

      const retVal = await service.notifyReceived({ notifyId: '' });
      expect(findSpy).toBeCalledWith({ where: { id: '' } });
      expect(updateStub).toBeCalledTimes(1);
      expect(updateStub).toBeCalledWith({
        status: ModuleIM.Common.NotifyStatus.Received,
      });
      expect(retVal).toBeUndefined();
    });

    it("should throw an error when update notify's status", () => {
      jest.spyOn(notifyModel, 'findOne').mockImplementation();
      expect(service.notifyReceived({ notifyId: '' })).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('notifyReaded', () => {
    it("should update notify's status to readed", async () => {
      const updateStub = jest.fn();
      const findSpy = jest.spyOn(notifyModel, 'findOne').mockReturnValue({
        update: updateStub,
      } as any);

      const retVal = await service.notifyReaded({ notifyId: '' });
      expect(findSpy).toBeCalledWith({ where: { id: '' } });
      expect(updateStub).toBeCalledTimes(1);
      expect(updateStub).toBeCalledWith({
        status: ModuleIM.Common.NotifyStatus.Readed,
      });
      expect(retVal).toBeUndefined();
    });

    it("should throw an error when update notify's status", () => {
      jest.spyOn(notifyModel, 'findOne').mockImplementation();
      expect(service.notifyReaded({ notifyId: '' })).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('getOfflineMsgs', () => {
    it('should get all messages & count', async () => {
      // Model.build() will throw error
      // await service.getOfflineMsgs(10007, { currentPage: 1, pageSize: 100 });
    });
  });

  describe('msgReceived', () => {
    it('should update lastAck for message successfully', () => {
      expect(
        service.msgReceived(10007, { id: BigInt(1) }),
      ).resolves.toBeUndefined();
    });
  });
});
