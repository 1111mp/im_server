import { Body, Controller, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend-dto';

@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('add')
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
}
