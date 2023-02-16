import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotifyDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: '0504339d-b2b6-48c9-a422-308163c8e8fc',
  })
  id: string;

  @ApiProperty({ type: 'number', required: true, example: 1 })
  type: ModuleIM.Common.Notifys;

  @ApiProperty({ type: 'number', required: true, example: 10007 })
  sender: number;

  @ApiProperty({ type: 'number', required: true, example: 10008 })
  receiver: number;

  @ApiProperty({ type: 'number', required: true, example: 1 })
  status: ModuleIM.Common.NotifyStatus;

  @ApiProperty({ type: 'string', required: true, example: '' })
  timer: string;

  @ApiProperty({ type: 'string', example: '' })
  remark?: string;

  @ApiProperty({ type: 'string', example: '' })
  ext?: string;
}

export class updateNotifyStatusDto {
  @ApiProperty({ type: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  notifyId: string;
}
