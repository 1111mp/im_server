import {
  Request,
  Body,
  Controller,
  Post,
  HttpStatus,
  Delete,
  Param,
  Get,
  Put,
  HttpCode,
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
import {
  AddMembersDto,
  CreateGroupDto,
  UpdateGroupDto,
} from './dto/create-group.dto';
import { Group as GroupModel } from 'src/api/groups/models/group.model';
import { User } from '../users/models/user.model';

@ApiTags('Groups')
@ApiExtraModels(GroupModel)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
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

  @Put(':id')
  @ApiOperation({
    summary: 'Update a groups basic info',
    description: 'Update a groups basic info',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successed to update.',
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
  updateOne(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.updateOne(parseInt(id), updateGroupDto);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add members to group',
    description: 'Add members to group',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  addMembers(@Param('id') id: string, @Body() addMembersDto: AddMembersDto) {
    return this.groupsService.addMembers(parseInt(id), addMembersDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user a groups info',
    description: 'Get user a groups info',
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
  getOne(@Param('id') id: string) {
    return this.groupsService.getOne(parseInt(id));
  }

  @Get()
  @ApiOperation({
    summary: 'Get user all groups info',
    description: 'Get user all groups info',
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
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(GroupModel) },
        },
      },
    },
  })
  getAll(@Request() req: IMServerRequest.RequestForAuthed) {
    return this.groupsService.getAll(req.user);
  }
}
