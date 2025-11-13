import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { LaborRateType, LaborRole } from '../entities/labor-rate.entity';

export class CreateLaborRateDto {
  @ApiProperty({ example: 'Standard Mechanic Rate' })
  @IsString()
  name: string;

  @ApiProperty({ enum: LaborRateType, example: LaborRateType.STANDARD })
  @IsEnum(LaborRateType)
  type: LaborRateType;

  @ApiProperty({ enum: LaborRole, example: LaborRole.MECHANIC })
  @IsEnum(LaborRole)
  role: LaborRole;

  @ApiProperty({ example: 125.00 })
  @IsNumber()
  hourlyRate: number;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
