import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ type: 'string', required: true, example: 'admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', example: '管理员' })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({ type: 'array', default: [] })
  @IsArray()
  permissions: number[];
}
