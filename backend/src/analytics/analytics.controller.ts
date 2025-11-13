import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall dashboard analytics' })
  getDashboard(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getDashboard(tenantId);
  }

  @Get('project/:projectId/breakdown')
  @ApiOperation({ summary: 'Get cost breakdown by category for a project' })
  getProjectBreakdown(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.analyticsService.getProjectBreakdown(tenantId, projectId);
  }
}
