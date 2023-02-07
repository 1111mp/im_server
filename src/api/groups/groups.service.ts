import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
  ) {}

  /**
   * @description: create one group
   * @params {user: User.UserInfo}
   * @params {createFriendDto: CreateGroupDto}
   * @returns {}
   */
  public async createOne(
    user: User.UserInfo,
    createGroupDto: CreateGroupDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    try {
      const { members, ...createDto } = createGroupDto;
      const trans = await this.groupModel.sequelize.transaction();

      const group = await this.groupModel.create(
        { ...createDto, creator: user.id },
        { transaction: trans },
      );

      await group.$set('members', members, {
        transaction: trans,
      });

      const membersInfo = await group.$get('members', {
        attributes: { exclude: ['pwd'] },
        transaction: trans,
      });

      await trans.commit();

      return {
        statusCode: HttpStatus.OK,
        message: 'Create group successful.',
        data: {
          ...group.toJSON(),
          members: [...membersInfo],
        },
      };
    } catch (err) {
      console.log(err);
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        throw new ForbiddenException(
          'The params members contains an invalid user id.',
        );
      }

      throw new InternalServerErrorException(`${err.name}: ${err.message}`);
    }
  }
}
