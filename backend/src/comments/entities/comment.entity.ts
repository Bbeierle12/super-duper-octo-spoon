import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

export enum CommentableType {
  PROJECT = 'project',
  TASK = 'task',
  PART = 'part',
  LABOR_ITEM = 'labor_item',
  PURCHASE_ORDER = 'purchase_order',
  CHANGE_ORDER = 'change_order',
}

@Entity('comments')
export class Comment extends TenantBaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: CommentableType,
  })
  commentableType: CommentableType;

  @Column('uuid')
  commentableId: string;

  @Column({ type: 'text' })
  content: string;

  @Column('uuid', { nullable: true })
  parentCommentId: string;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column('simple-array', { nullable: true })
  mentions: string[]; // Array of user IDs mentioned in the comment

  @Column('simple-array', { nullable: true })
  attachments: string[]; // Array of file URLs/paths
}
