import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChangeOrderType, ChangeOrderStatus } from '../entities/change-order.entity';

export class CreateChangeOrderDto {
  @ApiProperty({ description: 'Project ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'Change order title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the change' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ChangeOrderType, description: 'Type of change' })
  @IsEnum(ChangeOrderType)
  type: ChangeOrderType;

  @ApiPropertyOptional({
    enum: ChangeOrderStatus,
    default: ChangeOrderStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ChangeOrderStatus)
  status?: ChangeOrderStatus;

  @ApiPropertyOptional({ description: 'Budget impact (positive = increase, negative = decrease)' })
  @IsOptional()
  @IsNumber()
  budgetImpact?: number;

  @ApiPropertyOptional({ description: 'Timeline impact in days' })
  @IsOptional()
  @IsNumber()
  timelineImpactDays?: number;

  @ApiPropertyOptional({ description: 'Requested date (ISO format)' })
  @IsOptional()
  @IsDateString()
  requestedDate?: Date;

  @ApiPropertyOptional({ description: 'Affected category IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedCategories?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
