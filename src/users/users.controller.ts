import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
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
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/permission/decorators/roles.decorator';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import {
  UserLoginDto,
  CreateUserDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import { Public } from 'src/auth/decorators/jwt.decorator';
import { CacheApi } from 'src/cache/decotators/cache.decorator';

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
  ): Promise<IMServerResponse.JsonResponse<Omit<User.UserAttributes, 'pwd'>>> {
    const { account, pwd } = createUserDto;

    if (!account || !pwd) {
      throw new BadRequestException('Parameter error');
    }

    try {
      const user = await this.usersService.createOne(createUserDto);

      const { pwd, ...result } = user;
      const token = await this.authService.create(result);

      return {
        statusCode: HttpStatus.OK,
        token,
        message: 'Successed.',
        data: { avatar: null, email: null, ...result },
      };
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('The account already exists.');
      } else {
        throw new InternalServerErrorException(`${err.name}: ${err.message}`);
      }
    }
  }

  @Delete(':id')
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
  async deleteOne(
    @Request() req: IMServerRequest.RequestForHeader,
    @Param('id') id: string,
  ) {
    const { authorization } = req.headers;
    return this.usersService.deleteOne(id, authorization);
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
          example: 'Update successed.',
        },
      },
    },
  })
  async updateOne(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(updateUserDto);
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

    if (!user) {
      throw new NotFoundException();
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Successed.',
      data: user,
    };
  }

  @Post('logout')
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
