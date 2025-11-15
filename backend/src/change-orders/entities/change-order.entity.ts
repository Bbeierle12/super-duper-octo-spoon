import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../auth/entities/user.entity';

export enum ChangeOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  CANCELLED = 'cancelled',
}

export enum ChangeOrderType {
  SCOPE = 'scope',
  BUDGET = 'budget',
  TIMELINE = 'timeline',
  DESIGN = 'design',
  MATERIAL = 'material',
  OTHER = 'other',
}

@Entity('change_orders')
export class ChangeOrder extends TenantBaseEntity {
  @Column({ unique: true })
  coNumber: string; // Change Order number (e.g., CO-2024-0001)

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ChangeOrderType,
    default: ChangeOrderType.OTHER,
  })
  type: ChangeOrderType;

  @Column({
    type: 'enum',
    enum: ChangeOrderStatus,
    default: ChangeOrderStatus.DRAFT,
  })
  status: ChangeOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budgetImpact: number; // Positive = increase, Negative = decrease

  @Column({ type: 'int', default: 0 })
  timelineImpactDays: number; // Number of days added/subtracted

  @Column('uuid')
  requestedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: User;

  @Column('uuid', { nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @Column({ type: 'date', nullable: true })
  requestedDate: Date;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'date', nullable: true })
  implementedDate: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  implementationNotes: string;

  @Column('simple-array', { nullable: true })
  affectedCategories: string[]; // Category IDs affected

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>; // Additional flexible data
}
