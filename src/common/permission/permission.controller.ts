import {
  BadRequestException,
  Body,
  ConflictException,
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
import { validate } from 'class-validator';

@ApiTags('Permission')
@Controller('permission')
@ApiBearerAuth('token')
@ApiBearerAuth('userid')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async PermCreate(@Body() createPermDto: CreatePermDto) {
    const errors = await validate(createPermDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    try {
      const permission = await this.permissionService.createOne(createPermDto);

      return {
        statusCode: HttpStatus.OK,
        data: permission,
        message: 'Successfully.',
      };
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        throw new ConflictException('The permission already exists.');
    }
  }

  // @UseGuards(LocalAuthGuard)
  @Post('/role/create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  async RoleCreate(@Body() createRoleDto: CreateRoleDto) {
    const errors = await validate(createRoleDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const role = await this.permissionService.createRole(createRoleDto);
    return {
      statusCode: HttpStatus.OK,
      data: role,
      message: 'Successfully.',
    };
  }

  @Post('role/set')
  @HttpCode(HttpStatus.OK)
  async setUserRole() {}
}
