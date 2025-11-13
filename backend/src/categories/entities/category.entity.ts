import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { Part } from '../../parts/entities/part.entity';

export enum CategoryType {
  CHASSIS = 'chassis',
  SUSPENSION = 'suspension',
  ENGINE = 'engine',
  DRIVETRAIN = 'drivetrain',
  BRAKES = 'brakes',
  BODY_PAINT = 'body_paint',
  INTERIOR = 'interior',
  ELECTRICAL = 'electrical',
  WHEELS_TIRES = 'wheels_tires',
  FUEL = 'fuel',
  COOLING = 'cooling',
  EXHAUST = 'exhaust',
  SAFETY = 'safety',
  CUSTOM = 'custom',
}

@Entity('categories')
export class Category extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budgetAllocated: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Part, (part) => part.category)
  parts: Part[];

  get budgetRemaining(): number {
    return Number(this.budgetAllocated) - Number(this.totalSpent);
  }

  get budgetOverUnder(): number {
    return Number(this.totalSpent) - Number(this.budgetAllocated);
  }
}
