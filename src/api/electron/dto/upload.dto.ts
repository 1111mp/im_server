import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotIn, IsString } from 'class-validator';

export class FullUploadDto {
  @ApiProperty({ enum: ['macos', 'windows'], required: true })
  @IsString()
  @IsNotEmpty()
  @IsNotIn(['macos', 'windows'])
  platform: Electron.Common.Platform;

  @ApiProperty({ enum: ['x32', 'x64', 'arm64'], required: true })
  @IsString()
  @IsNotEmpty()
  @IsNotIn(['x32', 'x64', 'arm64'])
  archs: Electron.Common.Archs;

  @ApiProperty({ type: 'string', required: true, example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;
}

export class AsarUploadDto {
  @ApiProperty({ enum: ['macos', 'windows'], required: true })
  @IsString()
  @IsNotEmpty()
  @IsNotIn(['macos', 'windows'])
  platform: Electron.Common.Platform;

  @ApiProperty({ type: 'string', required: true, example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;
}

export class AppInfoDto {
  @ApiProperty({ enum: ['macos', 'windows'], required: true })
  @IsString()
  @IsNotEmpty()
  @IsNotIn(['macos', 'windows'])
  platform: Electron.Common.Platform;

  @ApiProperty({ enum: ['x32', 'x64', 'arm64'], required: true })
  @IsString()
  @IsNotEmpty()
  @IsNotIn(['x32', 'x64', 'arm64'])
  archs: Electron.Common.Archs;

  @ApiProperty({ type: 'string', required: true, example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version: string;
}
