import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendDto {
  @ApiProperty({ type: 'number', required: true, example: 10007 })
  userId: number;

  @ApiProperty({ type: 'string', required: false, example: '' })
  remark: string;

  @ApiProperty({ type: 'string', required: false, example: '' })
  ext: string;
}

export class UpdateFriendDto {
  @ApiProperty({ type: 'string' })
  remark?: string;

  @ApiProperty({ type: 'boolean' })
  astrolabe?: boolean;

  @ApiProperty({ type: 'boolean' })
  block?: boolean;
}

export class AgreeOrRejectDto {
  @ApiProperty({ type: 'string', required: true })
  notifyId: string;
}
