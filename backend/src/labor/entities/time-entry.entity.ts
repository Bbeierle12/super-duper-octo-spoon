import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Task } from '../../tasks/entities/task.entity';
import { LaborItem } from './labor-item.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('time_entries')
export class TimeEntry extends TenantBaseEntity {
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'task_id', nullable: true })
  taskId: string;

  @Column('uuid', { name: 'labor_item_id', nullable: true })
  laborItemId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isBillable: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => LaborItem, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'labor_item_id' })
  laborItem: LaborItem;

  get duration(): number | null {
    if (!this.endTime || !this.startTime) return null;

    const diff = new Date(this.endTime).getTime() - new Date(this.startTime).getTime();
    return diff / (1000 * 60 * 60); // Convert to hours
  }

  get computedCost(): number {
    const hoursWorked = this.hours || this.duration || 0;
    const rate = this.hourlyRate || 0;
    return hoursWorked * rate;
  }
}
