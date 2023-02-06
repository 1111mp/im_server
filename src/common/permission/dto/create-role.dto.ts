import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ type: 'string', required: true, example: 'admin' })
  name;

  @ApiProperty({ type: 'string', example: '管理员' })
  desc;

  @ApiProperty({ type: 'array', default: [] })
  permissions;
}
