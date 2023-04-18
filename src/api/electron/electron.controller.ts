import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ElectronService } from './electron.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Electron as ElectronModel } from './models/electron.model';
import { Public } from 'src/common/auth/decorators/jwt.decorator';
import { FullUploadDto, AsarUploadDto, AppInfoDto } from './dto/upload.dto';

@ApiTags('Electron')
@ApiExtraModels(ElectronModel)
@Controller('electron')
export class ElectronController {
  constructor(private readonly electronService: ElectronService) {}

  @Public()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'yml', maxCount: 1 }, { name: 'app' }]),
  )
  @Post('full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload(full) the files of Electron App.',
    description: 'Upload(full) the files of Electron App.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload files successed.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Upload successed.',
        },
      },
    },
  })
  fullUpload(
    @Body() fullUploadDto: FullUploadDto,
    @UploadedFiles()
    files: {
      yml?: Express.Multer.File[];
      app?: Express.Multer.File[];
    },
  ) {
    return this.electronService.fullUpload(fullUploadDto, files);
  }

  @Public()
  @Post('asar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload(asar) the files of Electron App.',
    description: 'Upload(asar) the files of Electron App.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload files successed.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Upload successed.',
        },
      },
    },
  })
  asarUpload(
    @Body() asarUploadDto: AsarUploadDto,
    @UploadedFiles()
    files: {
      app?: Express.Multer.File[];
    },
  ) {
    return this.electronService.asarUpload(asarUploadDto, files);
  }

  @Get('infoForAsar')
  @ApiOperation({
    summary: 'Get app info for asar update.',
    description: 'Get app info for asar update.',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Get info successed.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        data: {
          $ref: getSchemaPath(ElectronModel),
        },
      },
    },
  })
  appInfoForAsar(@Query() appInfoQuery: AppInfoDto) {
    return this.electronService.appInfoForAsar(appInfoQuery);
  }
}
