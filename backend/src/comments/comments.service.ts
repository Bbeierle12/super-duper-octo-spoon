import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentableType } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      tenantId,
      userId,
    });

    return this.commentsRepository.save(comment);
  }

  async findAll(tenantId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { tenantId },
      relations: ['user', 'parentComment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntity(
    tenantId: string,
    commentableType: CommentableType,
    commentableId: string,
  ): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { tenantId, commentableType, commentableId },
      relations: ['user', 'parentComment'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id, tenantId },
      relations: ['user', 'parentComment'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(tenantId, id);

    // Only allow the comment author to update
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    Object.assign(comment, updateCommentDto);
    comment.isEdited = true;
    comment.editedAt = new Date();

    return this.commentsRepository.save(comment);
  }

  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const comment = await this.findOne(tenantId, id);

    // Only allow the comment author to delete
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
  }

  async findReplies(tenantId: string, parentCommentId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { tenantId, parentCommentId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getCommentThread(tenantId: string, commentId: string): Promise<Comment[]> {
    // Get the comment and all its replies recursively
    const comment = await this.findOne(tenantId, commentId);
    const replies = await this.findReplies(tenantId, commentId);

    return [comment, ...replies];
  }

  async getEntityCommentCount(
    tenantId: string,
    commentableType: CommentableType,
    commentableId: string,
  ): Promise<number> {
    return this.commentsRepository.count({
      where: { tenantId, commentableType, commentableId },
    });
  }
}
