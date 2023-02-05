import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 } from 'uuid';
import { Friend } from './models/friend.model';
import { EventsService } from 'src/events/events.service';
import { CreateFriendDto } from './dto/create-friend-dto';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friend)
    private readonly friendModel: typeof Friend,
    private readonly eventsService: EventsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  public async addOne(
    sender: User.UserInfo,
    createFriendDto: CreateFriendDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    try {
      const { id: userId } = sender;
      const { userId: friendId, remark, ext } = createFriendDto;

      const count = await this.friendModel.count({
        where: {
          [Op.or]: [
            {
              userId,
              friendId,
            },
            {
              userId: friendId,
              friendId: userId,
            },
          ],
        },
      });

      if (count < 1) {
        throw new ForbiddenException(
          "It's already a friend relationship, don't repeat submit.",
        );
      }

      const notify: ModuleIM.Core.Notify = {
        id: v4(),
        type: ModuleIM.Common.Notifys.AddFriend,
        sender,
        receiver: friendId,
        status: ModuleIM.Common.NotifyStatus.Initial,
        timer: `${Date.now()}`,
        remark,
        ext,
      };

      await this.eventsService.createNotify({ ...notify, sender: userId });

      this.eventsGateway.sendNotify(notify);

      return {
        statusCode: HttpStatus.OK,
        message: 'Seccessed, wait for the other party to agree.',
      };
    } catch (err) {
      throw new InternalServerErrorException('Database error.');
    }
  }
}
