import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MembersService } from '../services/members.service';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { CurrentTenant, CurrentUser } from '../../common/decorators/tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/services/permissions.service';
import { User } from '../../auth/entities/user.entity';

@ApiTags('members')
@Controller('tenants/:tenantId/members')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new member to the tenant' })
  @RequirePermissions(Permission.MANAGE_MEMBERS)
  async inviteMember(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.membersService.inviteMember(
      tenantId,
      user.id,
      inviteMemberDto.email,
      inviteMemberDto.role,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all members of the tenant' })
  @RequirePermissions(Permission.VIEW_MEMBERS)
  async getMembers(@CurrentTenant() tenantId: string) {
    return this.membersService.getMembers(tenantId);
  }

  @Patch(':membershipId/role')
  @ApiOperation({ summary: 'Update a member\'s role' })
  @RequirePermissions(Permission.MANAGE_MEMBERS)
  async updateMemberRole(
    @CurrentTenant() tenantId: string,
    @Param('membershipId') membershipId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateMemberRole(
      tenantId,
      membershipId,
      updateMemberRoleDto.role,
    );
  }

  @Delete(':membershipId')
  @ApiOperation({ summary: 'Remove a member from the tenant' })
  @RequirePermissions(Permission.MANAGE_MEMBERS)
  async removeMember(
    @CurrentTenant() tenantId: string,
    @Param('membershipId') membershipId: string,
  ) {
    await this.membersService.removeMember(tenantId, membershipId);
    return { message: 'Member removed successfully' };
  }
}

// Invitation endpoints (public/less restricted)
@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  async getInvitation(@Param('token') token: string) {
    return this.membersService.getInvitation(token);
  }

  @Post(':token/accept')
  @ApiOperation({ summary: 'Accept an invitation' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async acceptInvitation(
    @Param('token') token: string,
    @CurrentUser() user: User,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    return this.membersService.acceptInvitation(token, user.id);
  }
}
