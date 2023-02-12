import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { LocalAuthGuard } from 'src/common/auth/guards/local-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermDto } from './dto/create-permission.dto';

@ApiTags('Permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async PermCreate(@Body() createPermDto: CreatePermDto) {
    return this.permissionService.createPerm(createPermDto);
  }

  // @UseGuards(LocalAuthGuard)
  @Post('/role/create')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth('token')
  // @ApiBearerAuth('userid')
  async RoleCreate(@Body() createRoleDto: CreateRoleDto) {
    return this.permissionService.createRole(createRoleDto);
  }

  @Post('role/set')
  @HttpCode(HttpStatus.OK)
  async setUserRole() {}
}
