import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.BACKLOG })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Task category (e.g., Engine, Body, Paint)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Due date in ISO format' })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Sort order for manual ordering' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'User ID to assign this task to' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Task ID this task depends on' })
  @IsOptional()
  @IsUUID()
  dependsOnTaskId?: string;

  @ApiPropertyOptional({ description: 'Additional notes in JSON format' })
  @IsOptional()
  notes?: string;
}
