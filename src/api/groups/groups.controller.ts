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
  BadRequestException,
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
import { validate } from 'class-validator';

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
  async create(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    const errors = await validate(createGroupDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const group = await this.groupsService.createOne(req.user, createGroupDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Create a group successed.',
      data: group,
    };
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
  async DeleteOne(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Param('id') id: string,
  ) {
    await this.groupsService.deleteOne(req.user, parseInt(id));

    return {
      statusCode: HttpStatus.OK,
      message: 'Successed to delete group.',
    };
  }

  @Put()
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
  async updateOne(@Body() updateGroupDto: UpdateGroupDto) {
    const errors = await validate(updateGroupDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    await this.groupsService.updateOne(updateGroupDto);

    return { statusCode: HttpStatus.OK, message: 'Update successed.' };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add members to group',
    description: 'Add members to group',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  async addMembers(@Body() addMembersDto: AddMembersDto) {
    const errors = await validate(addMembersDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    await this.groupsService.addMembers(addMembersDto);

    return { statusCode: HttpStatus.OK, message: 'Update successed.' };
  }

  @Get('withMembers')
  @ApiOperation({
    summary: 'Get user all groups with members',
    description: 'Get user all groups with members',
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
          items: {
            allOf: [
              { $ref: getSchemaPath(GroupModel) },
              {
                properties: {
                  count: {
                    type: 'number',
                    example: 1,
                  },
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
    },
  })
  async getAllWithMembers(@Request() req: IMServerRequest.RequestForAuthed) {
    const groups = await this.groupsService.getAllWithMembers(req.user);

    return {
      statusCode: HttpStatus.OK,
      data: groups,
    };
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
                count: {
                  type: 'number',
                  example: 1,
                },
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
  async getOne(@Param('id') id: string) {
    const group = await this.groupsService.getOne(parseInt(id));

    return {
      statusCode: HttpStatus.OK,
      data: group,
    };
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
  async getAll(@Request() req: IMServerRequest.RequestForAuthed) {
    const groups = await this.groupsService.getAll(req.user);

    return {
      statusCode: HttpStatus.OK,
      data: groups,
    };
  }
}
