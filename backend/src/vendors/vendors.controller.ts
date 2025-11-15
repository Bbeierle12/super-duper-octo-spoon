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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/services/permissions.service';
import {
  CreateVendorDto,
  UpdateVendorDto,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  // ========== Vendor Endpoints ==========

  @Post()
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  createVendor(
    @CurrentTenant() tenantId: string,
    @Body() createVendorDto: CreateVendorDto,
  ) {
    return this.vendorsService.create(tenantId, createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'Returns all vendors' })
  @ApiQuery({ name: 'search', required: false })
  findAllVendors(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.vendorsService.searchByName(tenantId, search);
    }
    return this.vendorsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiResponse({ status: 200, description: 'Returns the vendor' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findOneVendor(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.vendorsService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get vendor statistics' })
  @ApiResponse({ status: 200, description: 'Returns vendor stats' })
  getVendorStats(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.vendorsService.getVendorStats(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  updateVendor(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(tenantId, id, updateVendorDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({ status: 204, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  removeVendor(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.vendorsService.remove(tenantId, id);
  }

  // ========== Purchase Order Endpoints ==========

  @Post('purchase-orders')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  createPurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Body() createPODto: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.create(tenantId, createPODto);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Returns all purchase orders' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  findAllPurchaseOrders(
    @CurrentTenant() tenantId: string,
    @Query('projectId') projectId?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    if (projectId) {
      return this.purchaseOrdersService.findByProject(tenantId, projectId);
    }
    if (vendorId) {
      return this.purchaseOrdersService.findByVendor(tenantId, vendorId);
    }
    return this.purchaseOrdersService.findAll(tenantId);
  }

  @Get('purchase-orders/:id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the purchase order' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  findOnePurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.purchaseOrdersService.findOne(tenantId, id);
  }

  @Patch('purchase-orders/:id')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  updatePurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updatePODto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(tenantId, id, updatePODto);
  }

  @Patch('purchase-orders/:id/status')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updatePOStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: PurchaseOrderStatus,
  ) {
    return this.purchaseOrdersService.updateStatus(tenantId, id, status);
  }

  @Patch('purchase-orders/:id/items/:itemId/receive')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @ApiOperation({ summary: 'Mark items as received' })
  @ApiResponse({ status: 200, description: 'Items marked as received' })
  receiveItems(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body('quantityReceived') quantityReceived: number,
  ) {
    return this.purchaseOrdersService.receiveItems(
      tenantId,
      id,
      itemId,
      quantityReceived,
    );
  }

  @Delete('purchase-orders/:id')
  @RequirePermissions(Permission.MANAGE_VENDORS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiResponse({ status: 204, description: 'Purchase order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  removePurchaseOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.purchaseOrdersService.remove(tenantId, id);
  }
}
