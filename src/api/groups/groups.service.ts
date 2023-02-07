import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
  ) {}

  /**
   * @description: create one group
   * @param user User.UserInfo
   * @param createFriendDto CreateGroupDto
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async createOne(
    user: User.UserInfo,
    createGroupDto: CreateGroupDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const { members, ...createDto } = createGroupDto;
    try {
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
      this.logger.error(
        `[creator]: ${user.id} [members]: ${members}. Create group failed. ${err.name}: ${err.message}`,
      );
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        throw new ForbiddenException(
          'The params members contains an invalid user id.',
        );
      }

      throw new InternalServerErrorException(`${err.name}: ${err.message}`);
    }
  }

  /**
   * @description: delete a group by id
   * @param id number
   * @return Promise<IMServerResponse.JsonResponse<unknown>>
   */
  public async deleteOne(
    user: User.UserInfo,
    id: number,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const group = await this.groupModel.findOne({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`This group(${id}) does not exist.`);
    }

    if (group.creator !== user.id) {
      throw new UnauthorizedException();
    }

    try {
      const trans = await this.groupModel.sequelize.transaction();
      const members = await group.$get('members');

      await group.$remove('members', members, {
        transaction: trans,
      });

      await group.destroy({ transaction: trans });

      await trans.commit();

      // A group delete message should be sent to all members

      return {
        statusCode: HttpStatus.OK,
        message: 'Successed to delete group.',
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `[Database error]: ${err.name} ${err.message}`,
      );
    }
  }
}
