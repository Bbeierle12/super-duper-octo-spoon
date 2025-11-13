import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/services/permissions.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall dashboard analytics (legacy)' })
  @RequirePermissions(Permission.VIEW_REPORTS)
  getDashboard(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getDashboard(tenantId);
  }

  @Get('project/:projectId/breakdown')
  @ApiOperation({ summary: 'Get cost breakdown by category for a project (legacy)' })
  @RequirePermissions(Permission.VIEW_REPORTS)
  getProjectBreakdown(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.analyticsService.getProjectBreakdown(tenantId, projectId);
  }

  // ========== Phase 3: Advanced Analytics Endpoints ==========

  @Get('portfolio')
  @ApiOperation({ summary: 'Get portfolio-level metrics and budget health' })
  @RequirePermissions(Permission.VIEW_REPORTS)
  getPortfolioMetrics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getPortfolioMetrics(tenantId);
  }

  @Get('project/:projectId/budget-variance')
  @ApiOperation({ summary: 'Get detailed budget variance analysis for a project' })
  @RequirePermissions(Permission.VIEW_REPORTS)
  getProjectBudgetVariance(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.analyticsService.getProjectBudgetVariance(tenantId, projectId);
  }

  @Get('project/:projectId/timeline')
  @ApiOperation({ summary: 'Get timeline status and completion projections' })
  @RequirePermissions(Permission.VIEW_REPORTS)
  getProjectTimelineStatus(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.analyticsService.getProjectTimelineStatus(tenantId, projectId);
  }

  @Get('spending-trends')
  @ApiOperation({ summary: 'Get spending trends over time' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Number of months (default: 6)' })
  @RequirePermissions(Permission.VIEW_REPORTS)
  getSpendingTrends(
    @CurrentTenant() tenantId: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getSpendingTrends(tenantId, months);
  }
}
