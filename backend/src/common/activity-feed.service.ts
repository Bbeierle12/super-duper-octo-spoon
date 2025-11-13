import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivityFeed,
  ActivityType,
  ActivityEntityType,
} from './entities/activity-feed.entity';

export interface CreateActivityDto {
  activityType: ActivityType;
  entityType: ActivityEntityType;
  entityId: string;
  userId: string;
  projectId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityFeedService {
  constructor(
    @InjectRepository(ActivityFeed)
    private activityFeedRepository: Repository<ActivityFeed>,
  ) {}

  async create(tenantId: string, dto: CreateActivityDto): Promise<ActivityFeed> {
    const activity = this.activityFeedRepository.create({
      ...dto,
      tenantId,
    });

    return this.activityFeedRepository.save(activity);
  }

  async findByProject(
    tenantId: string,
    projectId: string,
    limit: number = 50,
  ): Promise<ActivityFeed[]> {
    return this.activityFeedRepository.find({
      where: { tenantId, projectId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEntity(
    tenantId: string,
    entityType: ActivityEntityType,
    entityId: string,
    limit: number = 20,
  ): Promise<ActivityFeed[]> {
    return this.activityFeedRepository.find({
      where: { tenantId, entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findAll(
    tenantId: string,
    filters?: {
      activityType?: ActivityType;
      entityType?: ActivityEntityType;
      userId?: string;
    },
    limit: number = 100,
  ): Promise<ActivityFeed[]> {
    const where: any = { tenantId };

    if (filters?.activityType) where.activityType = filters.activityType;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.userId) where.userId = filters.userId;

    return this.activityFeedRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Helper methods for common activities
  async logProjectCreated(
    tenantId: string,
    projectId: string,
    userId: string,
    projectName: string,
  ): Promise<ActivityFeed> {
    return this.create(tenantId, {
      activityType: ActivityType.PROJECT_CREATED,
      entityType: ActivityEntityType.PROJECT,
      entityId: projectId,
      userId,
      projectId,
      description: `Created project "${projectName}"`,
      metadata: { projectName },
    });
  }

  async logTaskCompleted(
    tenantId: string,
    taskId: string,
    projectId: string,
    userId: string,
    taskTitle: string,
  ): Promise<ActivityFeed> {
    return this.create(tenantId, {
      activityType: ActivityType.TASK_COMPLETED,
      entityType: ActivityEntityType.TASK,
      entityId: taskId,
      userId,
      projectId,
      description: `Completed task "${taskTitle}"`,
      metadata: { taskTitle },
    });
  }

  async logCommentAdded(
    tenantId: string,
    commentId: string,
    entityType: ActivityEntityType,
    entityId: string,
    userId: string,
    projectId: string,
  ): Promise<ActivityFeed> {
    return this.create(tenantId, {
      activityType: ActivityType.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: commentId,
      userId,
      projectId,
      description: `Added a comment`,
      metadata: { targetEntityType: entityType, targetEntityId: entityId },
    });
  }

  async logChangeOrderApproved(
    tenantId: string,
    coId: string,
    projectId: string,
    userId: string,
    coNumber: string,
  ): Promise<ActivityFeed> {
    return this.create(tenantId, {
      activityType: ActivityType.CHANGE_ORDER_APPROVED,
      entityType: ActivityEntityType.CHANGE_ORDER,
      entityId: coId,
      userId,
      projectId,
      description: `Approved change order ${coNumber}`,
      metadata: { coNumber },
    });
  }
}
