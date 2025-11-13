import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from './base.entity';

export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  INVITE = 'invite',
  EXPORT = 'export',
}

export enum ActivityEntityType {
  PROJECT = 'project',
  CATEGORY = 'category',
  PART = 'part',
  LABOR_ITEM = 'labor_item',
  TASK = 'task',
  MEDIA = 'media',
  USER = 'user',
  TENANT = 'tenant',
}

@Entity('activity_logs')
export class ActivityLog extends TenantBaseEntity {
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({
    type: 'enum',
    enum: ActivityEntityType,
  })
  entityType: ActivityEntityType;

  @Column('uuid', { nullable: true })
  entityId: string;

  @Column({ nullable: true })
  entityName: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    changes?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  };

  @Column({ nullable: true })
  description: string;
}
