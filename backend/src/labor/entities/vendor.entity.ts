import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { LaborItem } from './labor-item.entity';

export enum VendorType {
  SHOP = 'shop',
  PARTS_SUPPLIER = 'parts_supplier',
  MACHINIST = 'machinist',
  PAINT_BODY = 'paint_body',
  FABRICATOR = 'fabricator',
  UPHOLSTERY = 'upholstery',
  OTHER = 'other',
}

@Entity('vendors')
export class Vendor extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: VendorType,
  })
  type: VendorType;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @OneToMany(() => LaborItem, (laborItem) => laborItem.vendor)
  laborItems: LaborItem[];
}
