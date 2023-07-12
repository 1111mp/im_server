import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ type: 'string', example: '176xxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiProperty({ type: 'string', example: '**********' })
  @IsString()
  @IsNotEmpty()
  pwd: string;
}

export class CreateUserDto {
  @ApiProperty({ type: 'string', required: true, example: '176xxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiProperty({ type: 'string', required: true, example: '**********' })
  @IsString()
  @IsNotEmpty()
  pwd: string;

  @ApiProperty({ type: 'number', example: 5, default: 5 })
  roleId?: number;

  @ApiProperty({ type: 'string', example: '*****@gmail.com' })
  email?: string;

  @ApiProperty({ type: 'string', example: 'http://127.0.0.1/avatar.png' })
  avatar?: string;
}

export class UpdateUserDto {
  @ApiProperty({ type: 'number', example: 10001 })
  @IsNumber()
  userId: number;

  @ApiProperty({ type: 'string', example: '*****@gmail.com' })
  email?: string;

  @ApiProperty({ type: 'string', example: 'http://127.0.0.1/avatar.png' })
  avatar?: string;
}
