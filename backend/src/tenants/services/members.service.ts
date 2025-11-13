import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { Membership } from '../entities/membership.entity';
import { Invitation } from '../entities/invitation.entity';
import { User, UserRole } from '../../auth/entities/user.entity';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Membership)
    private membershipsRepository: Repository<Membership>,
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async inviteMember(
    tenantId: string,
    inviterUserId: string,
    email: string,
    role: UserRole,
  ): Promise<Invitation> {
    // Check if user is already a member
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      const existingMembership = await this.membershipsRepository.findOne({
        where: { tenantId, userId: existingUser.id },
      });

      if (existingMembership) {
        throw new BadRequestException('User is already a member of this tenant');
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationsRepository.findOne({
      where: { tenantId, email, acceptedAt: IsNull() },
    });

    if (existingInvitation && !existingInvitation.isExpired) {
      throw new BadRequestException('An invitation is already pending for this email');
    }

    // Create invitation
    const token = this.generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = this.invitationsRepository.create({
      tenantId,
      email,
      role,
      token,
      expiresAt,
      invitedByUserId: inviterUserId,
    });

    await this.invitationsRepository.save(invitation);

    // Send invitation email
    const inviter = await this.usersRepository.findOne({ where: { id: inviterUserId } });
    const inviterName = inviter ? inviter.fullName : 'A team member';

    // Get tenant name (would come from tenant entity)
    const tenantName = 'Your Garage'; // TODO: fetch from tenant

    await this.emailService.sendInvitation(email, inviterName, tenantName, token);

    return invitation;
  }

  async getMembers(tenantId: string): Promise<Membership[]> {
    return this.membershipsRepository.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateMemberRole(
    tenantId: string,
    membershipId: string,
    newRole: UserRole,
  ): Promise<Membership> {
    const membership = await this.membershipsRepository.findOne({
      where: { id: membershipId, tenantId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Prevent changing the last owner's role
    if (membership.role === UserRole.OWNER && newRole !== UserRole.OWNER) {
      const ownerCount = await this.membershipsRepository.count({
        where: { tenantId, role: UserRole.OWNER },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot change the role of the last owner');
      }
    }

    membership.role = newRole;
    return this.membershipsRepository.save(membership);
  }

  async removeMember(tenantId: string, membershipId: string): Promise<void> {
    const membership = await this.membershipsRepository.findOne({
      where: { id: membershipId, tenantId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Prevent removing the last owner
    if (membership.role === UserRole.OWNER) {
      const ownerCount = await this.membershipsRepository.count({
        where: { tenantId, role: UserRole.OWNER },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot remove the last owner');
      }
    }

    await this.membershipsRepository.remove(membership);
  }

  async getInvitation(token: string): Promise<Invitation> {
    const invitation = await this.invitationsRepository.findOne({
      where: { token },
      relations: ['tenant'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.isExpired) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.isAccepted) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<Membership> {
    const invitation = await this.getInvitation(token);

    // Check if user already has a membership
    const existingMembership = await this.membershipsRepository.findOne({
      where: { tenantId: invitation.tenantId, userId },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this tenant');
    }

    // Create membership
    const membership = this.membershipsRepository.create({
      tenantId: invitation.tenantId,
      userId,
      role: invitation.role,
    });

    await this.membershipsRepository.save(membership);

    // Mark invitation as accepted
    invitation.acceptedAt = new Date();
    await this.invitationsRepository.save(invitation);

    return membership;
  }

  private generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
