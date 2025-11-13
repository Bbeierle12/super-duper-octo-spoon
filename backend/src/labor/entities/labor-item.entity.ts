import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { Vendor } from './vendor.entity';

export enum LaborType {
  PAINT_BODY = 'paint_body',
  ENGINE_MACHINING = 'engine_machining',
  TUNING = 'tuning',
  DYNO = 'dyno',
  ALIGNMENT = 'alignment',
  FABRICATION = 'fabrication',
  CHROME_POLISH = 'chrome_polish',
  POWDER_COAT = 'powder_coat',
  UPHOLSTERY = 'upholstery',
  WIRING = 'wiring',
  CUSTOM = 'custom',
}

export enum LaborStatus {
  PLANNED = 'planned',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum BillingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  TIME_AND_MATERIALS = 'time_and_materials',
}

@Entity('labor_items')
export class LaborItem extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: LaborType,
  })
  type: LaborType;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: BillingType,
    default: BillingType.HOURLY,
  })
  billingType: BillingType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  actualHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualCost: number;

  @Column({
    type: 'enum',
    enum: LaborStatus,
    default: LaborStatus.PLANNED,
  })
  status: LaborStatus;

  @Column({ type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  notes: string;

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  @Column('uuid', { name: 'vendor_id', nullable: true })
  vendorId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Vendor, (vendor) => vendor.laborItems, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  get totalCost(): number {
    if (this.actualCost) return Number(this.actualCost);
    if (this.billingType === BillingType.FIXED) return Number(this.estimatedCost);
    if (this.billingType === BillingType.HOURLY && this.hourlyRate && this.estimatedHours) {
      return Number(this.hourlyRate) * Number(this.estimatedHours);
    }
    return Number(this.estimatedCost || 0);
  }
}
