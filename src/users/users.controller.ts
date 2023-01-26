import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('User')
@ApiExtraModels(User)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'User login',
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'user login',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 200,
        },
        token: {
          type: 'string',
          example: '28aeb634-95c1-4b57-983a-6bc0d0238042',
        },
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user info',
    description: 'Get user info by userid',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'The found record for user info',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 200,
        },
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}
