import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, BuildGoal } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: '1969 Camaro Pro-Touring Build' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Complete pro-touring build with modern performance' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Chevrolet' })
  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @ApiPropertyOptional({ example: 'Camaro' })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiPropertyOptional({ example: 1969 })
  @IsOptional()
  @IsNumber()
  vehicleYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: BuildGoal, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BuildGoal, { each: true })
  goals?: BuildGoal[];

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber()
  vehiclePurchasePrice?: number;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  totalBudget: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
