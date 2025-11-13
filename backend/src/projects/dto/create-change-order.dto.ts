import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChangeOrderType } from '../entities/change-order.entity';
import { ChangeOrderItemType } from '../entities/change-order-item.entity';

export class ChangeOrderItemDto {
  @ApiProperty({ example: 'part', enum: ChangeOrderItemType })
  @IsEnum(ChangeOrderItemType)
  itemType: ChangeOrderItemType;

  @ApiProperty({ example: 'Additional turbo upgrade' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 2500.00 })
  @IsNumber()
  unitCost: number;

  @ApiProperty({ example: 2500.00 })
  @IsNumber()
  totalCost: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateChangeOrderDto {
  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'Turbo upgrade scope addition' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Customer requested turbo upgrade instead of supercharger' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ChangeOrderType })
  @IsEnum(ChangeOrderType)
  type: ChangeOrderType;

  @ApiProperty({ example: 3500.00 })
  @IsNumber()
  budgetImpact: number;

  @ApiPropertyOptional({ example: 14 })
  @IsNumber()
  @IsOptional()
  scheduleImpact?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [ChangeOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeOrderItemDto)
  items: ChangeOrderItemDto[];
}
