import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermDto {
  @ApiProperty({ type: 'string', required: true, example: 'permission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', required: true, example: 'permission desc' })
  @IsString()
  @IsNotEmpty()
  desc: string;
}
