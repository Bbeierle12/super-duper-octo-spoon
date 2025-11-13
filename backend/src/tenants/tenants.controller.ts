import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('me')
  async getCurrentTenant(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }
}
