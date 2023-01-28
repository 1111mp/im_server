import { ApiProperty } from '@nestjs/swagger';

export class CreatePermDto {
  @ApiProperty({ type: 'string', required: true, example: 'permission' })
  name;

  @ApiProperty({ type: 'string', example: 'permission desc' })
  desc;
}
