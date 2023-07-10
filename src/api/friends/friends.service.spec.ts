import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { FriendsService } from './friends.service';
import { EventsService } from 'src/events/events.service';
import { Friend } from './models/friend.model';
import { FriendSetting } from './models/friend-setting.model';

describe('FriendsService', () => {
  let service: FriendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: getModelToken(Friend), useValue: {} },
        { provide: getModelToken(FriendSetting), useValue: {} },
        { provide: EventsService, useValue: {} },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
