import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('vendors')
export class Vendor extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  country: string;

  @Column('simple-array', { nullable: true })
  specialties: string[]; // e.g., ['paint', 'machine shop', 'upholstery']

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number; // 0.00 to 5.00

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  tags: string[]; // e.g., ['preferred', 'local', 'online']

  @OneToMany(() => PurchaseOrder, (po) => po.vendor)
  purchaseOrders: PurchaseOrder[];
}
