import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { join } from 'path';
import { existsSync, renameSync } from 'fs-extra';
import { validate } from 'class-validator';
import { Electron as ElectronModel } from './models/electron.model';
import { AppInfoDto, AsarUploadDto, FullUploadDto } from './dto/upload.dto';
import { mkdirsSync, removeFiles } from 'src/utils/files';

@Injectable()
export class ElectronService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(ElectronModel)
    private readonly electronModel: typeof ElectronModel,
    private readonly uploadPath: string = configService.get('MULTER_DEST'),
  ) {}

  /**
   * @description: full upload the files of Electron App
   * @param fullUploadDto FullUploadDto
   * @param files Record<string, Express.Multer.File | Express.Multer.File[]>
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  async fullUpload(
    fullUploadDto: FullUploadDto,
    files: Record<string, Express.Multer.File | Express.Multer.File[]>,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const errors = await validate(fullUploadDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const { platform, archs, version } = fullUploadDto;

    try {
      const appPath = join(
        this.uploadPath,
        'electron',
        Electron.Common.UpdateType.Full,
        version,
        platform,
        platform === Electron.Common.Platform.Windows ? archs : '',
        '/',
      );

      if (existsSync(appPath)) {
        removeFiles(files);
        throw new UnprocessableEntityException(
          `The current version[${version}] already exists under the platform[${platform}].`,
        );
      }

      mkdirsSync(appPath);

      for (let name in files) {
        const curFile = files[name];
        if (Array.isArray(curFile)) {
          curFile.forEach((file) => {
            const { originalname, path } = file;
            renameSync(path, appPath + originalname);
          });
        } else {
          const { originalname, path } = curFile;
          renameSync(path, appPath + originalname);
        }
      }

      await this.electronModel.create({
        type: Electron.Common.UpdateType.Full,
        platform,
        version,
        archs,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Upload successed.',
      };
    } catch (err) {
      removeFiles(files);
      throw new InternalServerErrorException(`${err.name}: ${err.message}`);
    }
  }

  /**
   * @description: asar upload the files of Electron App
   * @param asarUploadDto AsarUploadDto
   * @param files Record<string, Express.Multer.File | Express.Multer.File[]>
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  async asarUpload(
    asarUploadDto: AsarUploadDto,
    files: Record<string, Express.Multer.File | Express.Multer.File[]>,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const errors = await validate(asarUploadDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const { platform, version } = asarUploadDto;

    try {
      const appPath = join(
        this.uploadPath,
        'electron',
        Electron.Common.UpdateType.Asar,
        version,
        platform,
        '/',
      );

      if (existsSync(appPath)) {
        removeFiles(files);
        throw new UnprocessableEntityException(
          `The current version[${version}] already exists under the platform[${platform}].`,
        );
      }

      mkdirsSync(appPath);

      const curFile = files['app'];

      // windows one file | macos two files
      if (Array.isArray(curFile)) {
        curFile.forEach((file) => {
          const { originalname, path } = file;
          renameSync(path, appPath + originalname);
        });

        await this.electronModel.bulkCreate(
          curFile.map(({ originalname }) => ({
            type: Electron.Common.UpdateType.Asar,
            platform,
            version,
            archs: originalname?.split('.')[0] as Electron.Common.Archs,
          })),
        );
      } else {
        const { originalname, path } = curFile;
        renameSync(path, appPath + originalname);

        await this.electronModel.create({
          type: Electron.Common.UpdateType.Asar,
          platform,
          version,
          archs: originalname?.split('.')[0] as Electron.Common.Archs,
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Upload successed.',
      };
    } catch (err) {
      removeFiles(files);
      throw new InternalServerErrorException(`${err.name}: ${err.message}`);
    }
  }

  /**
   * @description: get app info for asar update
   * @param appInfoQuery AppInfoDto
   * @returns Promise<IMServerResponse.JsonResponse<unknown>>
   */
  async appInfoForAsar(
    appInfoQuery: AppInfoDto,
  ): Promise<IMServerResponse.JsonResponse<unknown>> {
    const errors = await validate(appInfoQuery);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const { platform, archs, version } = appInfoQuery;

    const info = await this.electronModel.findOne({
      raw: true,
      where: { platform, archs, actived: true },
    });

    // need to compare version
    if (!info || version === info.version)
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'No update available.',
      };

    return {
      statusCode: HttpStatus.OK,
      data: info,
    };
  }
}
