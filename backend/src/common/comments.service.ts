import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentEntityType } from './entities/comment.entity';

export interface CreateCommentDto {
  entityType: CommentEntityType;
  entityId: string;
  content: string;
  parentId?: string;
  mentions?: string[];
}

export interface UpdateCommentDto {
  content: string;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...dto,
      tenantId,
      userId,
    });

    return this.commentsRepository.save(comment);
  }

  async findByEntity(
    tenantId: string,
    entityType: CommentEntityType,
    entityId: string,
  ): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { tenantId, entityType, entityId },
      relations: ['user', 'parent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, commentId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, tenantId },
      relations: ['user', 'parent'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    tenantId: string,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, tenantId, userId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found or access denied');
    }

    comment.content = dto.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    return this.commentsRepository.save(comment);
  }

  async delete(
    tenantId: string,
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, tenantId, userId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found or access denied');
    }

    await this.commentsRepository.softRemove(comment);
  }
}
