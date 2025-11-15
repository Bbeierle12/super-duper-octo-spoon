import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ChangeOrdersService } from './change-orders.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/services/permissions.service';
import { CreateChangeOrderDto, UpdateChangeOrderDto } from './dto';

@ApiTags('change-orders')
@Controller('change-orders')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class ChangeOrdersController {
  constructor(private readonly changeOrdersService: ChangeOrdersService) {}

  @Post()
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @ApiOperation({ summary: 'Create a new change order' })
  @ApiResponse({ status: 201, description: 'Change order created successfully' })
  create(
    @CurrentTenant() tenantId: string,
    @Request() req: any,
    @Body() createChangeOrderDto: CreateChangeOrderDto,
  ) {
    const userId = req.user.userId;
    return this.changeOrdersService.create(tenantId, userId, createChangeOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all change orders' })
  @ApiResponse({ status: 200, description: 'Returns all change orders' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.changeOrdersService.findAll(tenantId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get change orders by project' })
  @ApiResponse({ status: 200, description: 'Returns change orders for a project' })
  findByProject(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.changeOrdersService.findByProject(tenantId, projectId);
  }

  @Get('project/:projectId/summary')
  @ApiOperation({ summary: 'Get change order summary for a project' })
  @ApiResponse({ status: 200, description: 'Returns summary statistics' })
  getProjectSummary(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.changeOrdersService.getProjectSummary(tenantId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a change order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the change order' })
  @ApiResponse({ status: 404, description: 'Change order not found' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.changeOrdersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @ApiOperation({ summary: 'Update a change order' })
  @ApiResponse({ status: 200, description: 'Change order updated successfully' })
  @ApiResponse({ status: 404, description: 'Change order not found' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateChangeOrderDto: UpdateChangeOrderDto,
  ) {
    return this.changeOrdersService.update(tenantId, id, updateChangeOrderDto);
  }

  @Patch(':id/approve')
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @ApiOperation({ summary: 'Approve a change order' })
  @ApiResponse({ status: 200, description: 'Change order approved' })
  approve(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.changeOrdersService.approve(tenantId, id, userId);
  }

  @Patch(':id/reject')
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @ApiOperation({ summary: 'Reject a change order' })
  @ApiResponse({ status: 200, description: 'Change order rejected' })
  reject(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason: string,
  ) {
    const userId = req.user.userId;
    return this.changeOrdersService.reject(tenantId, id, userId, reason);
  }

  @Patch(':id/implement')
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @ApiOperation({ summary: 'Mark a change order as implemented' })
  @ApiResponse({ status: 200, description: 'Change order marked as implemented' })
  implement(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('implementationNotes') implementationNotes?: string,
  ) {
    return this.changeOrdersService.implement(tenantId, id, implementationNotes);
  }

  @Patch(':id/cancel')
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @ApiOperation({ summary: 'Cancel a change order' })
  @ApiResponse({ status: 200, description: 'Change order cancelled' })
  cancel(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.changeOrdersService.cancel(tenantId, id);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a change order' })
  @ApiResponse({ status: 204, description: 'Change order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Change order not found' })
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.changeOrdersService.remove(tenantId, id);
  }
}
