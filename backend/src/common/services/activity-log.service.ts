import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityAction, ActivityEntityType } from '../entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async log(
    tenantId: string,
    userId: string,
    action: ActivityAction,
    entityType: ActivityEntityType,
    entityId?: string,
    metadata?: any,
  ): Promise<void> {
    const log = this.activityLogRepository.create({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      metadata,
    });

    await this.activityLogRepository.save(log);
  }

  async getRecentActivity(tenantId: string, limit: number = 50): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getActivityForEntity(
    tenantId: string,
    entityType: ActivityEntityType,
    entityId: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { tenantId, entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
