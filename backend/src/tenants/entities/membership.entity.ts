import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Tenant } from './tenant.entity';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/entities/user.entity';

@Entity('memberships')
@Unique(['userId', 'tenantId'])
export class Membership extends BaseEntity {
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column('uuid', { nullable: true })
  invitedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
