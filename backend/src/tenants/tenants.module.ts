import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { MembersService } from './services/members.service';
import { MembersController, InvitationsController } from './controllers/members.controller';
import { Tenant } from './entities/tenant.entity';
import { Membership } from './entities/membership.entity';
import { Invitation } from './entities/invitation.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Membership, Invitation, User])],
  controllers: [TenantsController, MembersController, InvitationsController],
  providers: [TenantsService, MembersService],
  exports: [TenantsService, MembersService],
})
export class TenantsModule {}
