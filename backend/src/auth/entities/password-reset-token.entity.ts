import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isUsed(): boolean {
    return !!this.usedAt;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isUsed;
  }
}
