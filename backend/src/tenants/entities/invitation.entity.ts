import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Tenant } from './tenant.entity';
import { UserRole } from '../../auth/entities/user.entity';

@Entity('invitations')
export class Invitation extends BaseEntity {
  @Column('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column('uuid', { name: 'invited_by_user_id' })
  invitedByUserId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isAccepted(): boolean {
    return !!this.acceptedAt;
  }
}
