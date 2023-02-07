import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ type: 'string', required: true, example: 'name' })
  name: string;

  @ApiProperty({ type: 'string', example: 'avatar url' })
  avatar?: string;

  @ApiProperty({ enum: [1, 2], required: true })
  type: ModuleIM.Common.GroupType;

  @ApiProperty({
    type: [Number],
    isArray: true,
    required: true,
    example: [10007],
  })
  members: number[];
}
