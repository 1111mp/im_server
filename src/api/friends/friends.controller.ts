import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { User as UserModel } from '../users/models/user.model';
import { FriendSetting } from './models/friend-setting.model';
import {
  AgreeOrRejectDto,
  CreateFriendDto,
  UpdateFriendDto,
} from './dto/create-friend-dto';

@ApiTags('Friends')
@ApiExtraModels(FriendSetting)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add a friend',
    description: 'Add a friend',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Add a friend',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Seccessed, wait for the other party to agree.',
        },
      },
    },
  })
  addOne(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() createFriendDto: CreateFriendDto,
  ) {
    return this.friendsService.addOne(req.user, createFriendDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a friend',
    description: 'Delete a friend',
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
        message: {
          type: 'string',
          example: 'Successfully deleted.',
        },
      },
    },
  })
  deleteOne(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Param('id') id: string,
  ) {
    return this.friendsService.deleteOne(parseInt(id), req.user);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update friend setting',
    description: 'Update friend setting',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successfully updated.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Successfully updated.',
        },
      },
    },
  })
  updateOne(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Param('id') id: string,
    @Body() updateFriendDto: UpdateFriendDto,
  ) {
    return this.friendsService.updateOne(
      req.user.id,
      parseInt(id),
      updateFriendDto,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one friend setting info',
    description: 'Get one friend setting info',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Get one friend setting info',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        data: {
          $ref: getSchemaPath(FriendSetting),
        },
      },
    },
  })
  getOne(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Param('id') id: string,
  ) {
    return this.friendsService.getOne(req.user.id, parseInt(id));
  }

  @Get()
  @ApiOperation({
    summary: 'Get user all friend, include friend setting info',
    description: 'Get user all friend, include friend setting info',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Get user all friend, not include friend setting info',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        data: {
          allOf: [
            {
              properties: {
                count: { type: 'number' },
                friends: {
                  type: 'array',
                  items: { $ref: getSchemaPath(UserModel) },
                },
              },
            },
          ],
        },
      },
    },
  })
  getAll(@Request() req: IMServerRequest.RequestForAuthed) {
    return this.friendsService.getAll(req.user.id);
  }

  @Post('agree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Agree to add yourself as a friend',
    description: 'Agree to add yourself as a friend',
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
  agree(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() agreeDto: AgreeOrRejectDto,
  ) {
    return this.friendsService.handleAgree(req.user, agreeDto);
  }

  @Post('reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject to add yourself as a friend',
    description: 'Reject to add yourself as a friend',
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
  reject(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() rejectDto: AgreeOrRejectDto,
  ) {
    return this.friendsService.handleReject(req.user, rejectDto);
  }
}
