import { Request, Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';

@ApiTags('Groups')
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
  create(
    @Request() req: IMServerRequest.RequestForAuthed,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupsService.createOne(req.user, createGroupDto);
  }
}
