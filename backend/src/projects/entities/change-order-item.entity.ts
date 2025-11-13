import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { ChangeOrder } from './change-order.entity';

export enum ChangeOrderItemType {
  PART = 'part',
  LABOR = 'labor',
  OTHER = 'other',
}

@Entity('change_order_items')
export class ChangeOrderItem extends TenantBaseEntity {
  @Column('uuid', { name: 'change_order_id' })
  changeOrderId: string;

  @Column({
    type: 'enum',
    enum: ChangeOrderItemType,
  })
  itemType: ChangeOrderItemType;

  @Column()
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => ChangeOrder, (co) => co.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'change_order_id' })
  changeOrder: ChangeOrder;
}
