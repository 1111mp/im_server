import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ type: 'string', example: '176xxxxxxxx' })
  account: string;

  @ApiProperty({ type: 'string', example: '**********' })
  pwd: string;
}
