import { IsOptional, IsEnum, IsUUID, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

export class FilterTasksDto {
  @ApiPropertyOptional({ enum: TaskStatus, description: 'Filter by task status' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, description: 'Filter by task priority' })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter tasks due after this date (ISO format)' })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter tasks due before this date (ISO format)' })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
