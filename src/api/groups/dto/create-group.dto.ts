import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsNotIn,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ type: 'string', example: 'name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', example: 'avatar url' })
  avatar?: string;

  @ApiProperty({ enum: [1, 2], required: true })
  @IsNumber()
  @IsNotIn([1, 2])
  type: ModuleIM.Common.GroupType;

  @ApiProperty({
    type: [Number],
    isArray: true,
    required: true,
    example: [10007],
  })
  @IsArray()
  @ArrayMinSize(1)
  members: number[];
}

export class UpdateGroupDto {
  @ApiProperty({ type: 'number', required: true, example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ type: 'string', required: true, example: 'name' })
  name?: string;

  @ApiProperty({ type: 'string', example: 'avatar url' })
  avatar?: string;
}

export class AddMembersDto {
  @ApiProperty({
    type: 'number',
    required: true,
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    type: [Number],
    isArray: true,
    required: true,
    example: [10007],
  })
  @IsArray()
  @ArrayMinSize(1)
  members: number[];
}
