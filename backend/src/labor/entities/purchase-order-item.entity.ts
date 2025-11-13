import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Part } from '../../parts/entities/part.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem extends TenantBaseEntity {
  @Column('uuid', { name: 'purchase_order_id' })
  purchaseOrderId: string;

  @Column('uuid', { name: 'part_id', nullable: true })
  partId: string;

  @Column()
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int', default: 0 })
  receivedQuantity: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Part, { nullable: true })
  @JoinColumn({ name: 'part_id' })
  part: Part;

  get lineTotal(): number {
    return Number(this.unitPrice) * this.quantity;
  }

  get isFullyReceived(): boolean {
    return this.receivedQuantity >= this.quantity;
  }
}
