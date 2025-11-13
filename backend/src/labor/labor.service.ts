import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaborItem } from './entities/labor-item.entity';
import { Vendor } from './entities/vendor.entity';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class LaborService {
  constructor(
    @InjectRepository(LaborItem)
    private laborRepository: Repository<LaborItem>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) {}

  // ========== Labor Items ==========

  async findByProject(tenantId: string, projectId: string): Promise<LaborItem[]> {
    return this.laborRepository.find({
      where: { tenantId, projectId },
      relations: ['vendor'],
      order: { createdAt: 'DESC' },
    });
  }

  // ========== Vendor Management ==========

  async createVendor(tenantId: string, dto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorRepository.create({
      ...dto,
      tenantId,
    });
    return this.vendorRepository.save(vendor);
  }

  async findAllVendors(tenantId: string): Promise<Vendor[]> {
    return this.vendorRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async findOneVendor(tenantId: string, vendorId: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId, tenantId },
      relations: ['laborItems'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async updateVendor(
    tenantId: string,
    vendorId: string,
    dto: UpdateVendorDto,
  ): Promise<Vendor> {
    const vendor = await this.findOneVendor(tenantId, vendorId);

    Object.assign(vendor, dto);
    return this.vendorRepository.save(vendor);
  }

  async deleteVendor(tenantId: string, vendorId: string): Promise<void> {
    const vendor = await this.findOneVendor(tenantId, vendorId);

    // Check if vendor has associated labor items
    const laborItemCount = await this.laborRepository.count({
      where: { vendorId, tenantId },
    });

    if (laborItemCount > 0) {
      throw new Error(
        `Cannot delete vendor with ${laborItemCount} associated labor items`,
      );
    }

    await this.vendorRepository.softRemove(vendor);
  }

  // ========== Purchase Order Management ==========

  async createPurchaseOrder(
    tenantId: string,
    dto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    // Generate PO number
    const count = await this.purchaseOrderRepository.count({ where: { tenantId } });
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Calculate total from items
    const totalAmount = dto.items.reduce((sum: number, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    // Create PO
    const purchaseOrder = this.purchaseOrderRepository.create({
      ...dto,
      poNumber,
      totalAmount,
      tenantId,
      status: dto.status || PurchaseOrderStatus.DRAFT,
    });

    const savedPO = await this.purchaseOrderRepository.save(purchaseOrder);

    // Create PO items
    const items = dto.items.map((item) =>
      this.purchaseOrderItemRepository.create({
        ...item,
        purchaseOrderId: savedPO.id,
        tenantId,
      }),
    );

    await this.purchaseOrderItemRepository.save(items);

    return this.findOnePurchaseOrder(tenantId, savedPO.id);
  }

  async findAllPurchaseOrders(
    tenantId: string,
    projectId?: string,
  ): Promise<PurchaseOrder[]> {
    const where: any = { tenantId };
    if (projectId) {
      where.projectId = projectId;
    }

    return this.purchaseOrderRepository.find({
      where,
      relations: ['vendor', 'items', 'items.part'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOnePurchaseOrder(
    tenantId: string,
    poId: string,
  ): Promise<PurchaseOrder> {
    const po = await this.purchaseOrderRepository.findOne({
      where: { id: poId, tenantId },
      relations: ['vendor', 'items', 'items.part', 'project'],
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    return po;
  }

  async updatePurchaseOrder(
    tenantId: string,
    poId: string,
    dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const po = await this.findOnePurchaseOrder(tenantId, poId);

    Object.assign(po, dto);
    await this.purchaseOrderRepository.save(po);

    return this.findOnePurchaseOrder(tenantId, poId);
  }

  async updatePurchaseOrderStatus(
    tenantId: string,
    poId: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrder> {
    const po = await this.findOnePurchaseOrder(tenantId, poId);

    po.status = status;

    if (status === PurchaseOrderStatus.ORDERED && !po.orderDate) {
      po.orderDate = new Date();
    }

    if (status === PurchaseOrderStatus.RECEIVED && !po.actualDeliveryDate) {
      po.actualDeliveryDate = new Date();
    }

    await this.purchaseOrderRepository.save(po);

    return this.findOnePurchaseOrder(tenantId, poId);
  }
}
