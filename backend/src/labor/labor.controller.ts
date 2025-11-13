import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LaborService } from './labor.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('labor')
@Controller('labor')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class LaborController {
  constructor(private readonly laborService: LaborService) {}

  @Get('project/:projectId')
  findByProject(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.laborService.findByProject(tenantId, projectId);
  }
}
