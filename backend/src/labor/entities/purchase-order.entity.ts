import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { Vendor } from './vendor.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Project } from '../../projects/entities/project.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder extends TenantBaseEntity {
  @Column({ unique: true })
  poNumber: string;

  @Column('uuid', { name: 'vendor_id' })
  vendorId: string;

  @Column('uuid', { name: 'project_id' })
  projectId: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus;

  @Column({ type: 'date', nullable: true })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.purchaseOrders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
  })
  items: PurchaseOrderItem[];

  get grandTotal(): number {
    return Number(this.totalAmount) + Number(this.tax) + Number(this.shipping);
  }
}
