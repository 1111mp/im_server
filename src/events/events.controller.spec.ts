import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController, eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            getOfflineNotifys: jest.fn(() => ({ rows: [], count: 0 })),
            notifyReceived: jest.fn(),
            notifyReaded: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOfflineNotify', () => {
    it('should return offline notifys & count', async () => {
      const retVal = await controller.getOfflineNotify({
        user: { id: 10007 },
      } as IMServerRequest.RequestForAuthed);

      expect(eventsService.getOfflineNotifys).toBeCalledTimes(1);
      expect(eventsService.getOfflineNotifys).toBeCalledWith(10007);
      expect(retVal).toEqual({ statusCode: HttpStatus.OK, count: 0, data: [] });
    });
  });

  describe('notify received', () => {
    it('should received notify successfully', () => {
      expect(controller.received({ notifyId: '' })).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      });
    });
  });

  describe('notify readed', () => {
    it('should readed notify successfully', () => {
      expect(controller.readed({ notifyId: '' })).resolves.toEqual({
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      });
    });
  });
});
