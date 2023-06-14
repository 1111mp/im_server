import {
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
  getOfflineNotify(@Request() req: IMServerRequest.RequestForAuthed) {
    return this.eventsService.getOfflineNotify(req.user.id);
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
  received(@Body() receivedNotifyDto: updateNotifyStatusDto) {
    return this.eventsService.receivedNotify(receivedNotifyDto);
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
  readed(@Body() readedNotifyDto: updateNotifyStatusDto) {
    return this.eventsService.readedNotify(readedNotifyDto);
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
  getOfflineMsgs(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Query('currentPage') currentPage: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.eventsService.getOfflineMsgs(req.user.id, {
      currentPage: currentPage ? parseInt(currentPage) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 100,
    });
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
  msgReceived(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() msgReceivedDto: MsgReceivedDto,
  ) {
    return this.eventsService.msgReceived(req.user.id, msgReceivedDto);
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
  uploadImage(
    @Request() req: IMServerRequest.RequestForAuthed,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventsService.uploadImage(req.user, file);
  }

  @Post('video')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'image file',
    type: ImageUploadDto,
  })
  uploadVideo(
    @Request() req: IMServerRequest.RequestForAuthed,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.eventsService.uploadVideo(req.user, file);
  }
}
