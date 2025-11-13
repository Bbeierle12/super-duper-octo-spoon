import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';

export enum LaborRateType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  SPECIALTY = 'specialty',
  WEEKEND = 'weekend',
  EMERGENCY = 'emergency',
}

export enum LaborRole {
  MECHANIC = 'mechanic',
  BODY_WORK = 'body_work',
  PAINT = 'paint',
  FABRICATION = 'fabrication',
  ELECTRICAL = 'electrical',
  TUNING = 'tuning',
  ASSEMBLY = 'assembly',
  GENERAL = 'general',
}

@Entity('labor_rates')
export class LaborRate extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: LaborRateType,
    default: LaborRateType.STANDARD,
  })
  type: LaborRateType;

  @Column({
    type: 'enum',
    enum: LaborRole,
    default: LaborRole.GENERAL,
  })
  role: LaborRole;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  get isEffective(): boolean {
    const today = new Date();
    const effective = new Date(this.effectiveDate);

    if (effective > today) return false;

    if (this.expirationDate) {
      const expiration = new Date(this.expirationDate);
      return expiration >= today;
    }

    return true;
  }
}
