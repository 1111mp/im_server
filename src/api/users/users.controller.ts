import {
  BadRequestException,
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
import { User as UserModel } from './models/user.model';
import { UsersService } from './users.service';
import { AuthService } from 'src/common/auth/auth.service';
import { Roles } from 'src/common/permission/decorators/roles.decorator';
import { LocalAuthGuard } from 'src/common/auth/guards/local-auth.guard';
import {
  UserLoginDto,
  CreateUserDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import { Public } from 'src/common/auth/decorators/jwt.decorator';
import { CacheApi } from 'src/common/cache/decotators/cache-api.decorator';
import { validate } from 'class-validator';

@ApiTags('User')
@ApiExtraModels(UserModel)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'User login',
  })
  @ApiBody({
    type: UserLoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'user login',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        token: {
          type: 'string',
          example: '28aeb634-95c1-4b57-983a-6bc0d0238042',
        },
        data: {
          $ref: getSchemaPath(UserModel),
        },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create user',
    description: 'Create user',
  })
  @ApiResponse({
    status: 200,
    description: 'Create user',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        token: {
          type: 'string',
          example: '28aeb634-95c1-4b57-983a-6bc0d0238042',
        },
        data: {
          $ref: getSchemaPath(UserModel),
        },
      },
    },
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<
    IMServerResponse.JsonResponse<
      Omit<User.UserAttributes, 'pwd'> & { token: string }
    >
  > {
    const errors = await validate(createUserDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const user = await this.usersService.createOne(createUserDto);

    const { pwd, ...result } = user;
    const token = await this.authService.create(result);

    return {
      statusCode: HttpStatus.OK,
      data: { avatar: null, email: null, ...result, token },
      message: 'successfully.',
    };
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Delete a user by userid',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successed to delete a user',
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
  async removeOne(@Request() req: IMServerRequest.RequestForHeader) {
    const { userid, authorization } = req.headers;
    await this.usersService.removeOne(parseInt(userid), authorization);
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    };
  }

  @Put()
  @ApiOperation({
    summary: 'Update user info',
    description: 'Update user info by userid',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successed to update user info',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Update successfully.',
        },
        data: {
          $ref: getSchemaPath(UserModel),
        },
      },
    },
  })
  async updateOne(@Body() updateUserDto: UpdateUserDto) {
    const errors = await validate(updateUserDto);
    if (errors.length)
      throw new BadRequestException('Incorrect request parameter.');

    const user = await this.usersService.updateOne(updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      data: user,
      message: 'Update successfully.',
    };
  }

  @Get(':id')
  @Roles(1)
  @CacheApi()
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
        statusCode: {
          type: 'number',
          example: 200,
        },
        data: {
          $ref: getSchemaPath(UserModel),
        },
      },
    },
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<IMServerResponse.JsonResponse<User.UserAttributes>> {
    const user = await this.usersService.findOne(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Successed.',
      data: user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'User logout',
  })
  @ApiBearerAuth('token')
  @ApiBearerAuth('userid')
  @ApiResponse({
    status: 200,
    description: 'Successed to logout',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 200,
        },
        message: {
          type: 'string',
          example: 'Logout successed.',
        },
      },
    },
  })
  async logout(@Request() req: IMServerRequest.RequestForHeader) {
    const { userid, authorization } = req.headers;
    await this.authService.delToken(userid, authorization);

    return {
      statusCode: HttpStatus.OK,
      message: 'Logout successed.',
    };
  }
}
