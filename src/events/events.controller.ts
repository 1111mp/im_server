import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { Notify as NotifyModel } from './models/notify.model';
import { Message as MessageModel } from './models/message.model';
import { updateNotifyStatusDto } from './dto/create-notify.dto';
import { MsgReceivedDto } from './dto/create-message.dto';
import { ImageUploadDto } from './dto/file-upload.dto';
import { validate } from 'class-validator';

@ApiTags('Events')
@ApiExtraModels(NotifyModel)
@ApiExtraModels(MessageModel)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('notify')
  @ApiOperation({
    // operationId: 'notify',
    summary: 'Get user all offline notifys',
    description: 'Get user all offline notifys',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successfully.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        count: {
          type: 'number',
        },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(NotifyModel),
          },
        },
      },
    },
  })
  async getOfflineNotify(@Request() req: IMServerRequest.RequestForAuthed) {
    const { rows, count } = await this.eventsService.getOfflineNotifys(
      req.user.id,
    );

    return {
      statusCode: HttpStatus.OK,
      count,
      data: rows,
    };
  }

  @Post('notify/received')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Notify received',
    description: 'Notify received',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successfully.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Successfully.',
        },
      },
    },
  })
  async received(@Body() receivedNotifyDto: updateNotifyStatusDto) {
    const errors = await validate(updateNotifyStatusDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    await this.eventsService.notifyReceived(receivedNotifyDto);

    return { statusCode: HttpStatus.OK, message: 'Successfully.' };
  }

  @Post('notify/readed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Notify readed',
    description: 'Notify readed',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successfully.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Successfully.',
        },
      },
    },
  })
  async readed(@Body() readedNotifyDto: updateNotifyStatusDto) {
    const errors = await validate(readedNotifyDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    await this.eventsService.notifyReaded(readedNotifyDto);

    return { statusCode: HttpStatus.OK, message: 'Successfully.' };
  }

  @Get('message')
  @ApiOperation({
    // operationId: 'notify',
    summary: 'Get user all offline messages',
    description: 'Get user all offline messages',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successfully.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        count: {
          type: 'number',
        },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(MessageModel),
          },
        },
      },
    },
  })
  async getOfflineMsgs(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Query('currentPage') currentPage: string,
    @Query('pageSize') pageSize: string,
  ) {
    const { rows, count } = await this.eventsService.getOfflineMsgs(
      req.user.id,
      {
        currentPage: currentPage ? parseInt(currentPage) : 1,
        pageSize: pageSize ? parseInt(pageSize) : 100,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      count,
      data: rows,
    };
  }

  @Post('message/received')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Message received',
    description: 'Message received',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successfully.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Successfully.',
        },
      },
    },
  })
  async msgReceived(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() msgReceivedDto: MsgReceivedDto,
  ) {
    const errors = await validate(msgReceivedDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    await this.eventsService.msgReceived(req.user.id, msgReceivedDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully',
    };
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'image file',
    type: ImageUploadDto,
  })
  async uploadImage(
    @Request() req: IMServerRequest.RequestForAuthed,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { path, smallPath } = await this.eventsService.uploadImage(
      req.user,
      file,
    );

    return {
      statusCode: HttpStatus.OK,
      data: {
        path,
        smallPath,
      },
    };
  }

  @Post('video')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'video file',
    type: ImageUploadDto,
  })
  async uploadVideo(
    @Request() req: IMServerRequest.RequestForAuthed,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { path, shotPath, smallPath } = await this.eventsService.uploadVideo(
      req.user,
      file,
    );

    return {
      statusCode: HttpStatus.OK,
      data: {
        path,
        shotPath,
        smallPath,
      },
    };
  }
}
