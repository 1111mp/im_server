import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { ProtoService } from 'src/common/proto/proto.service';

import type { Socket } from 'socket.io';

const testUint8Array = new Uint8Array();

const message = {
  id: 1,
  msgId: 'uuid',
  type: 'text',
  sender: 10007,
  receiver: 10009,
  content: 'Hello World',
  timer: 1689147760599,
};

const messageRead = {
  id: BigInt(1),
  sender: 10007,
  receiver: 10009,
};

describe('EventsGateway', () => {
  let gateway: EventsGateway,
    eventsService: EventsService,
    protoService: ProtoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: EventsService,
          useValue: {
            createOneForMessage: jest.fn(() => message),
            addMessageTaskToQueue: jest.fn(),
            upsertLastRead: jest.fn(() => [{}, 1]),
            addMessageReadTaskToQueue: jest.fn(),
          },
        },
        {
          provide: ProtoService,
          useValue: {
            getMessageFromProto: jest.fn(() => message),
            getMessageReadFromProto: jest.fn(() => messageRead),
            setAckToProto: jest.fn(
              (resp: IMServerResponse.AckResponse) => testUint8Array,
            ),
            getNotifyFromProto: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    eventsService = module.get<EventsService>(EventsService);
    protoService = module.get<ProtoService>(ProtoService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('on-message', () => {
    it('should be able to run gateway.handleMessage', async () => {
      const retVal = await gateway.handleMessage(testUint8Array, {
        decoded: { user: 10007 },
      } as unknown as Socket);

      expect(protoService.getMessageFromProto).toBeCalledWith(testUint8Array);
      expect(eventsService.createOneForMessage).toBeCalledWith(message);
      expect(eventsService.addMessageTaskToQueue).toBeCalledWith({
        ...message,
        senderInfo: 10007,
      });
      expect(protoService.setAckToProto).toBeCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      });
      expect(Object.prototype.toString.call(retVal)).toBe(
        '[object Uint8Array]',
      );
    });
  });

  describe('on-message:read', () => {
    it('should be able to run gateway.handleMessageRead', async () => {
      const retVal = await gateway.handleMessageRead(
        testUint8Array,
        {} as Socket,
      );

      expect(protoService.getMessageReadFromProto(testUint8Array)).toEqual(
        messageRead,
      );
      expect(protoService.setAckToProto).toBeCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      });
      expect(Object.prototype.toString.call(retVal)).toBe(
        '[object Uint8Array]',
      );
    });

    it('should throw an error when run gateway.handleMessageRead', async () => {
      const upsertLastRead = jest
        .spyOn(eventsService, 'upsertLastRead')
        .mockReturnValue([undefined, 0] as any);
      const retVal = await gateway.handleMessageRead(
        testUint8Array,
        {} as Socket,
      );

      expect(upsertLastRead).toBeCalledTimes(1);
      expect(upsertLastRead).toBeCalledWith(messageRead);
      expect(protoService.setAckToProto).toBeCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error.',
      });
      expect(Object.prototype.toString.call(retVal)).toBe(
        '[object Uint8Array]',
      );
    });
  });

  // describe('on-notify', () => {
  //   it('should be able to run gateway.handleNotify', async () => {
  //     await gateway.handleNotify(testUint8Array, {} as Socket);
  //   });
  // });
});
