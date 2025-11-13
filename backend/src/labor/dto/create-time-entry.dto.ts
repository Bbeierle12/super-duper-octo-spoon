import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateTimeEntryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  laborItemId?: string;

  @ApiProperty({ example: '2025-11-13T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ example: '2025-11-13T17:00:00Z' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ example: 8.0 })
  @IsNumber()
  @IsOptional()
  hours?: number;

  @ApiPropertyOptional({ example: 125.00 })
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'Engine tear down and inspection' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;
}
