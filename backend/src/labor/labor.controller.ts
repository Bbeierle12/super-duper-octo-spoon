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
}
