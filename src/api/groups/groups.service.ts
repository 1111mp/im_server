import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { literal } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './models/group.model';
import { User as UserModel } from 'src/api/users/models/user.model';
import {
  AddMembersDto,
  CreateGroupDto,
  UpdateGroupDto,
} from './dto/create-group.dto';

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
          count: members.length,
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

  public async updateOne(id: number, updateGroupDto: UpdateGroupDto) {
    const { name, avatar } = updateGroupDto;

    if (!name && !avatar) {
      throw new BadRequestException();
    }

    const [count] = await this.groupModel.update(
      { name, avatar },
      {
        where: { id },
      },
    );

    if (count === 1) {
      return { statusCode: HttpStatus.OK, message: 'Update successed.' };
    }

    if (count === 0) {
      throw new NotFoundException('No resources are updated.');
    }

    throw new InternalServerErrorException('Database error.');
  }

  public async addMembers(
    id: number,
    addMembersDto: AddMembersDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const group = await this.groupModel.findOne({ where: { id } });

    const { members } = addMembersDto;

    if (!group) {
      throw new NotFoundException('No resources are updated.');
    }

    try {
      const res = await group.$add('members', members);

      if (!res) {
        throw new ForbiddenException('Do not add repeatedly.');
      }

      // need send a notify message to new added members

      return { statusCode: HttpStatus.OK, message: 'Update successed.' };
    } catch (err) {
      if (err.name === 'ForbiddenException') throw err;

      if (err.name === 'SequelizeForeignKeyConstraintError') {
        throw new NotFoundException('User does not exist.');
      }
      throw new InternalServerErrorException(
        `[Database error]: ${err.name} ${err.message}`,
      );
    }
  }

  public async getOne(
    id: number,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const group = await this.groupModel.findOne({ where: { id } });

    if (!group) {
      throw new NotFoundException();
    }

    try {
      const members = await group.$get('members', {
        raw: true,
        attributes: { exclude: ['pwd'] },
        // @ts-ignore
        joinTableAttributes: [],
      });

      return {
        statusCode: HttpStatus.OK,
        data: { ...group.toJSON(), count: members.length, members },
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `[Database error]: ${err.name} ${err.message}`,
      );
    }
  }

  public async getAll(
    user: User.UserInfo,
  ): Promise<IMServerResponse.JsonResponse<ModuleIM.Core.Group[]>> {
    try {
      const groups = await UserModel.build({ id: user.id }).$get('groups', {
        raw: true,
        attributes: {
          include: [
            [
              literal(
                `(
                  SELECT COUNT(*)
                  FROM Members AS Member
                  WHERE
                    Member.groupId = Group.id
                )`,
              ),
              'count',
            ],
          ],
        },
        // @ts-ignore
        joinTableAttributes: [],
      });

      return {
        statusCode: HttpStatus.OK,
        data: groups,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `[Database error]: ${err.name} ${err.message}`,
      );
    }
  }

  public async getGroupMembersById(groupId: number) {
    const group = await this.groupModel.findOne({ where: { id: groupId } });
    const members = await group.$get('members', {
      raw: true,
      attributes: ['id'],
    });
    return members;
  }
}
