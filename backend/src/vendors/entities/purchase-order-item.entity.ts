import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Part } from '../../parts/entities/part.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem extends TenantBaseEntity {
  @Column('uuid')
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column('uuid', { nullable: true })
  partId: string;

  @ManyToOne(() => Part, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'part_id' })
  part: Part;

  @Column()
  description: string;

  @Column({ type: 'int', default: 1 })
  quantityOrdered: number;

  @Column({ type: 'int', default: 0 })
  quantityReceived: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal: number;

  @Column({ nullable: true })
  partNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
