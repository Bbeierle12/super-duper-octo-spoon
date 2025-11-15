import { IsString, IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentableType } from '../entities/comment.entity';

export class CreateCommentDto {
  @ApiProperty({ enum: CommentableType, description: 'Type of entity being commented on' })
  @IsEnum(CommentableType)
  commentableType: CommentableType;

  @ApiProperty({ description: 'ID of the entity being commented on' })
  @IsUUID()
  commentableId: string;

  @ApiProperty({ description: 'Comment text content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for threaded replies' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiPropertyOptional({ description: 'User IDs mentioned in comment', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional({ description: 'File attachment URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
