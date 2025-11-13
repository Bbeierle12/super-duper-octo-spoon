import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Project } from './project.entity';
import { ChangeOrderItem } from './change-order-item.entity';

export enum ChangeOrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
}

export enum ChangeOrderType {
  SCOPE_ADDITION = 'scope_addition',
  SCOPE_REDUCTION = 'scope_reduction',
  COST_ADJUSTMENT = 'cost_adjustment',
  TIMELINE_EXTENSION = 'timeline_extension',
}

@Entity('change_orders')
export class ChangeOrder extends TenantBaseEntity {
  @Column({ unique: true })
  coNumber: string;

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ChangeOrderType,
  })
  type: ChangeOrderType;

  @Column({
    type: 'enum',
    enum: ChangeOrderStatus,
    default: ChangeOrderStatus.DRAFT,
  })
  status: ChangeOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budgetImpact: number;

  @Column({ type: 'int', nullable: true })
  scheduleImpact: number; // days

  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  @Column({ type: 'date', nullable: true })
  rejectedAt: Date;

  @Column('uuid', { name: 'submitted_by_id', nullable: true })
  submittedById: string;

  @Column('uuid', { name: 'approved_by_id', nullable: true })
  approvedById: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => ChangeOrderItem, (item) => item.changeOrder, {
    cascade: true,
  })
  items: ChangeOrderItem[];
}
