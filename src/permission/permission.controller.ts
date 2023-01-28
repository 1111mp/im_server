import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermDto } from './dto/create-permission.dto';

@ApiTags('Permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  async PermCreate(@Body() createPermDto: CreatePermDto) {
    return this.permissionService.createPerm(createPermDto);
  }

  // @UseGuards(LocalAuthGuard)
  @Post('/role/create')
  // @ApiBearerAuth('token')
  // @ApiBearerAuth('userid')
  async RoleCreate(@Body() createRoleDto: CreateRoleDto) {
    return this.permissionService.createRole(createRoleDto);
  }

  @Post('role/set')
  async setUserRole() {}
}
