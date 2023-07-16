import {
  ForbiddenException,
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
   * @returns Promise<unknown>
   */
  public async createOne(user: User.UserInfo, createGroupDto: CreateGroupDto) {
    const { members, ...createDto } = createGroupDto;
    const transaction = await this.groupModel.sequelize.transaction();
    try {
      const group = await this.groupModel.create(
        { ...createDto, creator: user.id },
        { transaction },
      );

      await group.$set('members', members, {
        transaction,
      });

      const membersInfo = await group.$get('members', {
        attributes: { exclude: ['pwd'] },
        transaction,
      });

      await transaction.commit();

      return {
        ...group.toJSON(),
        count: members.length,
        members: [...membersInfo],
      };
    } catch (err) {
      await transaction.rollback();
      this.logger.error(
        `[creator]: ${user.id} [members]: ${members}. Create group failed. ${err.name}: ${err.message}`,
      );
      if (err.name === 'SequelizeForeignKeyConstraintError')
        throw new ForbiddenException(
          'The params members contains an invalid user id.',
        );
    }
  }

  /**
   * @description: delete a group by id
   * @param id number
   * @return Promise<void>
   */
  public async deleteOne(user: User.UserInfo, id: number): Promise<void> {
    const group = await this.groupModel.findOne({
      where: { id },
    });

    if (!group) throw new NotFoundException(`No group found with id ${id}`);
    if (group.creator !== user.id) throw new UnauthorizedException();

    const transaction = await this.groupModel.sequelize.transaction();
    try {
      const members = await group.$get('members');

      await group.$remove('members', members, {
        transaction,
      });

      await group.destroy({ transaction });

      await transaction.commit();

      // A group delete message should be sent to all members
    } catch (err) {
      await transaction.rollback();
      throw new InternalServerErrorException(
        `[Database error]: ${err.name} ${err.message}`,
      );
    }
  }

  public async updateOne({ id, ...updateGroupDto }: UpdateGroupDto) {
    const group = await this.groupModel.findOne({ where: { id } });

    if (!group) throw new NotFoundException(`No group found with id ${id}`);

    await group.update(updateGroupDto);
  }

  public async addMembers({ id, members }: AddMembersDto): Promise<void> {
    const group = await this.groupModel.findOne({ where: { id } });

    if (!group) throw new NotFoundException(`No group found with id ${id}`);

    await group.$add('members', members);
    // need send a notify message to new added members
  }

  public async getOne(id: number) {
    const group = await this.groupModel.findOne({ where: { id } });

    if (!group) throw new NotFoundException(`No group found with id ${id}`);

    const members = await group.$get('members', {
      raw: true,
      attributes: { exclude: ['pwd'] },
      // @ts-ignore
      joinTableAttributes: [],
    });

    return { ...group.toJSON(), count: members.length, members };
  }

  public async getAll(user: User.UserInfo): Promise<ModuleIM.Core.Group[]> {
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
      order: [['name', 'DESC']],
      // @ts-ignore
      joinTableAttributes: [],
    });

    return groups;
  }

  public async getAllWithMembers(
    user: User.UserInfo,
  ): Promise<ModuleIM.Core.Group[]> {
    const groups = await UserModel.build({ id: user.id }).$get('groups', {
      // raw: true,
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
      include: [
        {
          model: UserModel,
          as: 'members',
          attributes: { exclude: ['pwd'] },
          through: {
            attributes: [],
          },
        },
      ],
      order: [['name', 'ASC']],
      // @ts-ignore
      joinTableAttributes: [],
    });

    return groups;
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
