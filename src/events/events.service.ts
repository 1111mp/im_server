import { join } from 'path';
import { rename, ensureDir } from 'fs-extra';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';

import * as ffmpeg from 'fluent-ffmpeg';
import { Notify } from './models/notify.model';
import { GroupsService } from 'src/api/groups/groups.service';
import { Message as MessageModel } from './models/message.model';
import { MessageAck as MessageAckModel } from './models/message-ack.model';
import { MessageRead as MessageReadModel } from './models/message-read.model';
import { User as UserModel } from 'src/api/users/models/user.model';
import {
  CreateNotifyDto,
  updateNotifyStatusDto,
} from './dto/create-notify.dto';
import { GetOfflineMsgsDto, MsgReceivedDto } from './dto/create-message.dto';
import { IMQueueName } from './constants';
import { CacheFnResult } from 'src/common/cache/decotators/cache-fn.decorator';

import type { Transaction } from 'sequelize';
import type { Queue } from 'bull';
import { runFfmpegCmd, runScreenShotCmd } from 'src/utils/ffmpeg';

@Injectable()
export class EventsService {
  private readonly uploadPath: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Notify)
    private readonly notifyModel: typeof Notify,
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
    @InjectModel(MessageAckModel)
    private readonly messageAckModel: typeof MessageAckModel,
    @InjectModel(MessageReadModel)
    private readonly messageReadModel: typeof MessageReadModel,
    @InjectQueue(IMQueueName) private readonly imQueue: Queue<unknown>,
    private readonly groupService: GroupsService,
  ) {
    this.uploadPath = this.configService.get('MULTER_DEST');
  }

  public createNotify(notify: CreateNotifyDto, trans: Transaction = null) {
    return this.notifyModel.create(notify, { transaction: trans });
  }

  public findNotifyById(id: string) {
    return this.notifyModel.findOne({ where: { id } });
  }

  /**
   * @description: Add a send notify task to IMQueue
   * @param ModuleIM.Core.Notify
   * @returns Promise<void>
   */
  public addNotifyTaskToQueue(notify: ModuleIM.Core.Notify) {
    return this.imQueue.add('send-notify', notify);
  }

  /**
   * @description: Get user all offline notifys
   * @param userId number
   * @return Promise<{ rows: Notify[]; count: number; }>
   */
  public async getOfflineNotifys(userId: number): Promise<{
    rows: Notify[];
    count: number;
  }> {
    return await this.notifyModel.findAndCountAll({
      raw: true,
      where: {
        receiver: userId,
        status: ModuleIM.Common.NotifyStatus.Initial,
      },
      include: UserModel,
    });
  }

  /**
   * @description: Notify received
   * @param receivedNotifyDto: updateNotifyStatusDto,
   * @return Promise<void>
   */
  public async notifyReceived(
    receivedNotifyDto: updateNotifyStatusDto,
  ): Promise<void> {
    const notify = await this.notifyModel.findOne({
      where: { id: receivedNotifyDto.notifyId },
    });

    if (!notify)
      throw new NotFoundException(
        `No notify found with id ${receivedNotifyDto.notifyId}`,
      );

    await notify.update({ status: ModuleIM.Common.NotifyStatus.Received });
  }

  /**
   * @description: Notify Readed
   * @param receivedNotifyDto: updateNotifyStatusDto,
   * @return Promise<void>
   */
  public async notifyReaded(
    readedNotifyDto: updateNotifyStatusDto,
  ): Promise<void> {
    const notify = await this.notifyModel.findOne({
      where: { id: readedNotifyDto.notifyId },
    });

    if (!notify)
      throw new NotFoundException(
        `No notify found with id ${readedNotifyDto.notifyId}`,
      );

    await notify.update({ status: ModuleIM.Common.NotifyStatus.Readed });
  }

  /**
   * @description: Get user all offline messages
   * @param userId number
   * @param getOfflineMsgsDto GetOfflineMsgsDto,
   * @return Promise<{ rows: MessageModel[]; count: number; }>
   */
  public async getOfflineMsgs(
    userId: number,
    getOfflineMsgsDto: GetOfflineMsgsDto,
  ): Promise<{
    rows: MessageModel[];
    count: number;
  }> {
    const { currentPage, pageSize } = getOfflineMsgsDto;

    const { lastAck = 0 } = (await this.getLastAck(userId)) || {};
    const userGroups = await UserModel.build({ id: userId }).$get('groups', {
      raw: true,
      attributes: ['id'],
      // @ts-ignore
      joinTableAttributes: [],
    });

    return await this.messageModel.findAndCountAll({
      // raw: true,
      where: {
        id: {
          [Op.gt]: lastAck,
        },
        [Op.or]: [
          { receiver: userId },
          {
            groupId: userGroups.map(({ id }) => id),
          },
        ],
      },
      include: {
        model: UserModel,
        attributes: {
          exclude: ['pwd'],
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      order: [['timer', 'DESC']],
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
    });
  }

  /**
   * @description: messsage received
   * @param userId number,
   * @param msgReceivedDto MsgReceivedDto,
   * @return Promise<void>
   */
  public async msgReceived(
    userId: number,
    msgReceivedDto: MsgReceivedDto,
  ): Promise<void> {
    const { id } = msgReceivedDto;

    await this.upsertLastAck({
      receiver: userId,
      lastAck: id,
      lastAckErr: null,
    });
  }

  /**
   * @description: Add a send message:all task to IMQueue
   * @param ModuleIM.Core.MessageAll
   * @returns Promise<void>
   */
  public addMessageTaskToQueue(message: ModuleIM.Core.MessageBasic) {
    return this.imQueue.add('send-message', message);
  }

  /**
   * @description: Add a send message:read task to IMQueue
   * @param ModuleIM.Core.MessageRead
   * @returns Promise<void>
   */
  public addMessageReadTaskToQueue(message: ModuleIM.Core.MessageRead) {
    return this.imQueue.add('send-message:read', message);
  }

  /**
   * @description: update notify status
   * @param {string} id
   * @param {ModuleIM} status
   * @return {Promise<[affectedCount:number]>}
   */
  public updateNotifyStatus(
    id: string,
    status: ModuleIM.Common.NotifyStatus,
    trans?: Transaction,
  ) {
    return this.notifyModel.update(
      { status },
      { where: { id }, transaction: trans },
    );
  }

  /**
   * @description: Create one Message
   * @param message ModuleIM.Core.MessageAll
   * @returns Promise<MessageModel>
   */
  public createOneForMessage(
    message: Omit<ModuleIM.Core.MessageBasic, 'senderInfo'>,
  ) {
    return this.messageModel.create({
      ...message,
    });
  }

  /**
   * @description: get group members
   * @param groupId number
   * @return Promise<User[]>
   */
  @CacheFnResult()
  public getGroupMembersById(groupId: number) {
    return this.groupService.getGroupMembersById(groupId);
  }

  /**
   * @description: get last ack info
   * @param receiver  number
   * @return Promise<MessageAckModel>
   */
  public getLastAck(receiver: number) {
    return this.messageAckModel.findOne({
      raw: true,
      where: {
        receiver,
      },
    });
  }

  /**
   * @description: update or insert message MessageAckModel
   * @param value { receiver: number; lastAck: bigint; lastAckErr: bigint; }
   * @return Promise<[MessageAckModel, boolean]>
   */
  public upsertLastAck({
    receiver,
    lastAck,
    lastAckErr,
  }: {
    receiver: number;
    lastAck: bigint;
    lastAckErr: bigint;
  }) {
    return this.messageAckModel.upsert({ receiver, lastAck, lastAckErr });
  }

  /**
   * @description: update or insert message MessageReadModel
   * @param message ModuleIM.Core.MessageRead
   * @return Promise<[instance:MessageReadModel | null, affectedCount:number | null]>
   */
  public async upsertLastRead(
    message: ModuleIM.Core.MessageRead,
  ): Promise<[MessageReadModel | null, number | null]> {
    const { id, groupId, sender, receiver } = message;
    const where = { sender: groupId ? groupId : sender, receiver };

    const exist = await this.messageReadModel.count({
      where,
    });

    if (exist) {
      // update
      const [affectedCount] = await this.messageReadModel.update(
        { lastRead: id },
        { where },
      );

      return [null, affectedCount];
    }

    // insert
    const instance = await this.messageReadModel.create({
      ...where,
      lastRead: id,
    });

    return [instance, null];
  }

  public async uploadImage(
    user: User.UserInfo,
    file: Express.Multer.File,
  ): Promise<{ path: string; smallPath: string }> {
    const path = join(this.uploadPath, `${user.id}`, '/');

    await ensureDir(path);

    const { originalname, path: filePath } = file;
    const finalPath = path + originalname;
    const name = originalname.split('.');
    const smallPath = path + name[0] + '-small.' + name[1];

    await rename(filePath, finalPath);

    await runFfmpegCmd(ffmpeg(finalPath).size('20x?').output(smallPath));

    return {
      path: finalPath,
      smallPath,
    };
  }

  public async uploadVideo(
    user: User.UserInfo,
    file: Express.Multer.File,
  ): Promise<{ path: string; shotPath: string; smallPath: string }> {
    const path = join(this.uploadPath, `${user.id}`, '/');

    await ensureDir(path);

    const { originalname, path: filePath } = file;
    const finalPath = path + originalname;
    const name = originalname.split('.');
    const shotName = name[0] + '.png';
    const smallName = name[0] + '-small.png';

    await rename(filePath, finalPath);

    await Promise.all([
      runScreenShotCmd(
        ffmpeg(finalPath).screenshot({
          count: 1,
          filename: shotName,
          folder: path,
        }),
      ),
      runScreenShotCmd(
        ffmpeg(finalPath).screenshot({
          count: 1,
          filename: smallName,
          folder: path,
          size: '20x?',
        }),
      ),
    ]);

    return {
      path: finalPath,
      shotPath: path + shotName,
      smallPath: path + smallName,
    };
  }
}
