import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { User } from '../../auth/entities/user.entity';

export enum ActivityType {
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_STATUS_CHANGED = 'project_status_changed',
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
  PART_ADDED = 'part_added',
  LABOR_ADDED = 'labor_added',
  COMMENT_ADDED = 'comment_added',
  MEDIA_UPLOADED = 'media_uploaded',
  CHANGE_ORDER_CREATED = 'change_order_created',
  CHANGE_ORDER_APPROVED = 'change_order_approved',
  CHANGE_ORDER_REJECTED = 'change_order_rejected',
  MEMBER_INVITED = 'member_invited',
  MEMBER_JOINED = 'member_joined',
  PURCHASE_ORDER_CREATED = 'purchase_order_created',
  TIME_ENTRY_LOGGED = 'time_entry_logged',
}

export enum ActivityEntityType {
  PROJECT = 'project',
  TASK = 'task',
  PART = 'part',
  CATEGORY = 'category',
  LABOR_ITEM = 'labor_item',
  COMMENT = 'comment',
  MEDIA = 'media',
  CHANGE_ORDER = 'change_order',
  PURCHASE_ORDER = 'purchase_order',
  TIME_ENTRY = 'time_entry',
  MEMBER = 'member',
}

@Entity('activity_feed')
export class ActivityFeed extends TenantBaseEntity {
  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityEntityType,
  })
  entityType: ActivityEntityType;

  @Column('uuid', { name: 'entity_id' })
  entityId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'project_id', nullable: true })
  projectId: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
