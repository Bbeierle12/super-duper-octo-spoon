import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Category } from '../../categories/entities/category.entity';
import { Task } from '../../tasks/entities/task.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  TEARDOWN = 'teardown',
  MOCK_UP = 'mock_up',
  FABRICATION = 'fabrication',
  PAINT = 'paint',
  ASSEMBLY = 'assembly',
  TUNING = 'tuning',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum BuildGoal {
  STREET = 'street',
  TRACK = 'track',
  DRAG = 'drag',
  DRIFT = 'drift',
  OVERLAND = 'overland',
  SHOW = 'show',
  RESTOMOD = 'restomod',
  RESTORATION = 'restoration',
}

@Entity('projects')
export class Project extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  vehicleMake: string;

  @Column({ nullable: true })
  vehicleModel: string;

  @Column({ type: 'int', nullable: true })
  vehicleYear: number;

  @Column({ nullable: true })
  vin: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: BuildGoal,
    array: true,
    default: [],
  })
  goals: BuildGoal[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vehiclePurchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalBudget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  targetCompletionDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @ManyToOne(() => Tenant, (tenant) => tenant.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Category, (category) => category.project)
  categories: Category[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @OneToMany(() => MediaAsset, (media) => media.project)
  media: MediaAsset[];
}
