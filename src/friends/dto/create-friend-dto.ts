import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendDto {
  @ApiProperty({ type: 'number', required: true, example: 10007 })
  userId: number;

  @ApiProperty({ type: 'string', required: false, example: '' })
  remark: string;

  @ApiProperty({ type: 'string', required: false, example: '' })
  ext: string;
}
