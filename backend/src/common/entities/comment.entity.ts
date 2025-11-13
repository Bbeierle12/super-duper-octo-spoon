import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { User } from '../../auth/entities/user.entity';

export enum CommentEntityType {
  PROJECT = 'project',
  TASK = 'task',
  PART = 'part',
  CATEGORY = 'category',
  LABOR_ITEM = 'labor_item',
  CHANGE_ORDER = 'change_order',
}

@Entity('comments')
export class Comment extends TenantBaseEntity {
  @Column({
    type: 'enum',
    enum: CommentEntityType,
  })
  entityType: CommentEntityType;

  @Column('uuid', { name: 'entity_id' })
  entityId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column('uuid', { name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ type: 'simple-array', nullable: true })
  mentions: string[]; // Array of user IDs mentioned

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;
}
