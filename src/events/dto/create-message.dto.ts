import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetOfflineMsgsDto {
  @ApiProperty({ type: 'number', required: true })
  currentPage: number;

  @ApiProperty({ type: 'number', required: true })
  pageSize: number;
}

export class MsgReceivedDto {
  @ApiProperty({ type: 'bigint', required: true })
  @IsNotEmpty()
  id: bigint;
}
