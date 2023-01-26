import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
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
import { User as UserModel } from './models/user.model';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserLoginDto, CreateUserDto } from './dto/create-user.dto';

@ApiTags('User')
@ApiExtraModels(UserModel)
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

  @Post('create')
  @ApiOperation({
    summary: 'Create user',
    description: 'Create user',
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
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<IMServerResponse.JsonResponse<Omit<User.UserAttributes, 'pwd'>>> {
    const { account, pwd } = createUserDto;

    if (!account || !pwd) {
      throw new BadRequestException('Parameter error');
    }

    try {
      const user = (await this.usersService.create(createUserDto)).toJSON();
      const { pwd, ...result } = user;
      const token = await this.authService.create(result);

      return {
        statusCode: IMServerResponse.StatusCode.Success,
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
    try {
      const user = await this.usersService.findOne(id);

      if (!user) {
        throw new NotFoundException();
      }

      return {
        statusCode: IMServerResponse.StatusCode.Success,
        message: 'Successed.',
        data: user,
      };
    } catch (err) {
      throw new InternalServerErrorException(`${err.name}: ${err.message}`);
    }
  }
}
