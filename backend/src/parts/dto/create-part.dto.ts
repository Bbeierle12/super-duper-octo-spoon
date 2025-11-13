import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartStatus } from '../entities/part.entity';

export class CreatePartDto {
  @ApiProperty({ example: 'Hotchkis Sport Suspension Kit' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Hotchkis' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ example: '80115-1' })
  @IsOptional()
  @IsString()
  partNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fitmentNotes?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ example: 2499.99 })
  @IsNumber()
  listPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  negotiatedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  actualPrice?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  estimatedShipping?: number;

  @ApiPropertyOptional({ example: 'Summit Racing' })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorUrl?: string;

  @ApiPropertyOptional({ enum: PartStatus, default: PartStatus.PLANNED })
  @IsOptional()
  @IsEnum(PartStatus)
  status?: PartStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCriticalPath?: boolean;

  @ApiProperty()
  @IsUUID()
  categoryId: string;
}
