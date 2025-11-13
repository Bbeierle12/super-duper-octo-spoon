import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ActivityFeedService,
} from './activity-feed.service';
import {
  ActivityType,
  ActivityEntityType,
} from './entities/activity-feed.entity';
import { CurrentTenant } from './decorators/tenant.decorator';
import { TenantGuard } from './guards/tenant.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { Permission } from './services/permissions.service';

@ApiTags('activity')
@Controller('activity')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class ActivityFeedController {
  constructor(private readonly activityFeedService: ActivityFeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity feed' })
  @ApiQuery({ name: 'activityType', enum: ActivityType, required: false })
  @ApiQuery({ name: 'entityType', enum: ActivityEntityType, required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('entityType') entityType?: ActivityEntityType,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityFeedService.findAll(
      tenantId,
      { activityType, entityType, userId },
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get activity feed for a project' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findByProject(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityFeedService.findByProject(
      tenantId,
      projectId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get activity feed for a specific entity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findByEntity(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: ActivityEntityType,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityFeedService.findByEntity(
      tenantId,
      entityType,
      entityId,
      limit ? parseInt(limit) : 20,
    );
  }
}
