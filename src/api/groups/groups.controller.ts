import {
  Request,
  Body,
  Controller,
  Post,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group as GroupModel } from './models/group.model';
import { User } from '../users/models/user.model';
import { Public } from 'src/common/auth/decorators/jwt.decorator';

@ApiTags('Groups')
@ApiExtraModels(GroupModel)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a im group',
    description: 'Create a im group',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successed to create a group.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
        },
        data: {
          allOf: [
            { $ref: getSchemaPath(GroupModel) },
            {
              properties: {
                members: {
                  type: 'array',
                  items: { $ref: getSchemaPath(User) },
                },
              },
            },
          ],
        },
      },
    },
  })
  create(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupsService.createOne(req.user, createGroupDto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a im group',
    description: 'Delete a im group',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successed to delete a group.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
        },
      },
    },
  })
  DeleteOne(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Param('id') id: string,
  ) {
    return this.groupsService.deleteOne(req.user, parseInt(id));
  }
}
