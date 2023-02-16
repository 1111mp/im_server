import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Notify as NotifyModel } from './models/notify.model';
import { updateNotifyStatusDto } from './dto/create-notify.dto';

@ApiTags('Events')
@ApiExtraModels(NotifyModel)
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
    description: 'Successfully deleted.',
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
}
