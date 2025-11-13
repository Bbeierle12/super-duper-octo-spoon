import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LaborService } from './labor.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/services/permissions.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';
import { CreateLaborRateDto } from './dto/create-labor-rate.dto';
import { UpdateLaborRateDto } from './dto/update-labor-rate.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('labor')
@Controller('labor')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class LaborController {
  constructor(private readonly laborService: LaborService) {}

  // ========== Labor Items ==========

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get labor items for a project' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findByProject(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.laborService.findByProject(tenantId, projectId);
  }

  // ========== Vendor Management ==========

  @Post('vendors')
  @ApiOperation({ summary: 'Create a new vendor' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  createVendor(@CurrentTenant() tenantId: string, @Body() dto: CreateVendorDto) {
    return this.laborService.createVendor(tenantId, dto);
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Get all vendors' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findAllVendors(@CurrentTenant() tenantId: string) {
    return this.laborService.findAllVendors(tenantId);
  }

  @Get('vendors/:vendorId')
  @ApiOperation({ summary: 'Get vendor details' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findOneVendor(
    @CurrentTenant() tenantId: string,
    @Param('vendorId') vendorId: string,
  ) {
    return this.laborService.findOneVendor(tenantId, vendorId);
  }

  @Patch('vendors/:vendorId')
  @ApiOperation({ summary: 'Update vendor' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  updateVendor(
    @CurrentTenant() tenantId: string,
    @Param('vendorId') vendorId: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.laborService.updateVendor(tenantId, vendorId, dto);
  }

  @Delete('vendors/:vendorId')
  @ApiOperation({ summary: 'Delete vendor' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  async deleteVendor(
    @CurrentTenant() tenantId: string,
    @Param('vendorId') vendorId: string,
  ) {
    await this.laborService.deleteVendor(tenantId, vendorId);
    return { message: 'Vendor deleted successfully' };
  }

  // ========== Purchase Order Management ==========

  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create a new purchase order' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  createPurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.laborService.createPurchaseOrder(tenantId, dto);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiQuery({ name: 'projectId', required: false })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findAllPurchaseOrders(
    @CurrentTenant() tenantId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.laborService.findAllPurchaseOrders(tenantId, projectId);
  }

  @Get('purchase-orders/:poId')
  @ApiOperation({ summary: 'Get purchase order details' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findOnePurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Param('poId') poId: string,
  ) {
    return this.laborService.findOnePurchaseOrder(tenantId, poId);
  }

  @Patch('purchase-orders/:poId')
  @ApiOperation({ summary: 'Update purchase order' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  updatePurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Param('poId') poId: string,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    return this.laborService.updatePurchaseOrder(tenantId, poId, dto);
  }

  @Patch('purchase-orders/:poId/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  updatePurchaseOrderStatus(
    @CurrentTenant() tenantId: string,
    @Param('poId') poId: string,
    @Body('status') status: PurchaseOrderStatus,
  ) {
    return this.laborService.updatePurchaseOrderStatus(tenantId, poId, status);
  }

  // ========== Labor Rates ==========

  @Post('labor-rates')
  @ApiOperation({ summary: 'Create a new labor rate' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  createLaborRate(@CurrentTenant() tenantId: string, @Body() dto: CreateLaborRateDto) {
    return this.laborService.createLaborRate(tenantId, dto);
  }

  @Get('labor-rates')
  @ApiOperation({ summary: 'Get all labor rates' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findAllLaborRates(
    @CurrentTenant() tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    if (activeOnly === 'true') {
      return this.laborService.findActiveLaborRates(tenantId);
    }
    return this.laborService.findAllLaborRates(tenantId);
  }

  @Get('labor-rates/:rateId')
  @ApiOperation({ summary: 'Get labor rate details' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findOneLaborRate(
    @CurrentTenant() tenantId: string,
    @Param('rateId') rateId: string,
  ) {
    return this.laborService.findOneLaborRate(tenantId, rateId);
  }

  @Patch('labor-rates/:rateId')
  @ApiOperation({ summary: 'Update labor rate' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  updateLaborRate(
    @CurrentTenant() tenantId: string,
    @Param('rateId') rateId: string,
    @Body() dto: UpdateLaborRateDto,
  ) {
    return this.laborService.updateLaborRate(tenantId, rateId, dto);
  }

  @Delete('labor-rates/:rateId')
  @ApiOperation({ summary: 'Delete labor rate' })
  @RequirePermissions(Permission.MANAGE_PARTS)
  async deleteLaborRate(
    @CurrentTenant() tenantId: string,
    @Param('rateId') rateId: string,
  ) {
    await this.laborService.deleteLaborRate(tenantId, rateId);
    return { message: 'Labor rate deleted successfully' };
  }

  // ========== Time Tracking ==========

  @Post('time-entries')
  @ApiOperation({ summary: 'Create a new time entry' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  createTimeEntry(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateTimeEntryDto,
  ) {
    return this.laborService.createTimeEntry(tenantId, user.id, dto);
  }

  @Get('time-entries')
  @ApiOperation({ summary: 'Get time entries' })
  @ApiQuery({ name: 'taskId', required: false })
  @ApiQuery({ name: 'laborItemId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findTimeEntries(
    @CurrentTenant() tenantId: string,
    @Query('taskId') taskId?: string,
    @Query('laborItemId') laborItemId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.laborService.findTimeEntries(tenantId, { taskId, laborItemId, userId });
  }

  @Get('time-entries/:entryId')
  @ApiOperation({ summary: 'Get time entry details' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findOneTimeEntry(
    @CurrentTenant() tenantId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.laborService.findOneTimeEntry(tenantId, entryId);
  }

  @Patch('time-entries/:entryId')
  @ApiOperation({ summary: 'Update time entry' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  updateTimeEntry(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.laborService.updateTimeEntry(tenantId, entryId, user.id, dto);
  }

  @Patch('time-entries/:entryId/stop')
  @ApiOperation({ summary: 'Stop timer for time entry' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  stopTimer(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('entryId') entryId: string,
  ) {
    return this.laborService.stopTimer(tenantId, entryId, user.id);
  }

  @Delete('time-entries/:entryId')
  @ApiOperation({ summary: 'Delete time entry' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  async deleteTimeEntry(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('entryId') entryId: string,
  ) {
    await this.laborService.deleteTimeEntry(tenantId, entryId, user.id);
    return { message: 'Time entry deleted successfully' };
  }

  @Get('tasks/:taskId/time-summary')
  @ApiOperation({ summary: 'Get time summary for a task' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  getTaskTimeSummary(
    @CurrentTenant() tenantId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.laborService.getTaskTimeSummary(tenantId, taskId);
  }

  @Get('projects/:projectId/labor-summary')
  @ApiOperation({ summary: 'Get labor summary for a project' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  getProjectLaborSummary(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.laborService.getProjectLaborSummary(tenantId, projectId);
  }
}
