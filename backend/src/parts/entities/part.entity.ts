import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';

export enum PartStatus {
  PLANNED = 'planned',
  ON_ORDER = 'on_order',
  RECEIVED = 'received',
  INSTALLED = 'installed',
  REMOVED = 'removed',
}

@Entity('parts')
export class Part extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  partNumber: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  fitmentNotes: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  listPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  negotiatedPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedShipping: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualShipping: number;

  @Column({ nullable: true })
  vendor: string;

  @Column({ nullable: true })
  vendorUrl: string;

  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.PLANNED,
  })
  status: PartStatus;

  @Column({ type: 'date', nullable: true })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

  @Column({ type: 'date', nullable: true })
  installedDate: Date;

  @Column({ default: false })
  isCriticalPath: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column('uuid', { name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.parts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  get totalCost(): number {
    const price = Number(this.actualPrice || this.negotiatedPrice || this.listPrice);
    const shipping = Number(this.actualShipping || this.estimatedShipping || 0);
    return (price + shipping) * this.quantity;
  }

  get projectedCost(): number {
    const price = Number(this.negotiatedPrice || this.listPrice);
    const shipping = Number(this.estimatedShipping || 0);
    return (price + shipping) * this.quantity;
  }
}
