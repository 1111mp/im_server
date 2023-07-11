import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({ type: 'string', example: '176xxxxxxxx' })
  account: string;

  @ApiProperty({ type: 'string', example: '**********' })
  pwd: string;
}

export class CreateUserDto {
  @ApiProperty({ type: 'string', required: true, example: '176xxxxxxxx' })
  account: string;

  @ApiProperty({ type: 'string', required: true, example: '**********' })
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
  userId: number;

  @ApiProperty({ type: 'string', example: '*****@gmail.com' })
  email?: string;

  @ApiProperty({ type: 'string', example: 'http://127.0.0.1/avatar.png' })
  avatar?: string;
}
