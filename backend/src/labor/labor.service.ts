import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaborItem } from './entities/labor-item.entity';
import { Vendor } from './entities/vendor.entity';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { LaborRate } from './entities/labor-rate.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreateLaborRateDto } from './dto/create-labor-rate.dto';
import { UpdateLaborRateDto } from './dto/update-labor-rate.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

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
    @InjectRepository(LaborRate)
    private laborRateRepository: Repository<LaborRate>,
    @InjectRepository(TimeEntry)
    private timeEntryRepository: Repository<TimeEntry>,
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

  // ========== Labor Rates ==========

  async createLaborRate(tenantId: string, dto: CreateLaborRateDto): Promise<LaborRate> {
    const rate = this.laborRateRepository.create({
      ...dto,
      tenantId,
    });
    return this.laborRateRepository.save(rate);
  }

  async findAllLaborRates(tenantId: string): Promise<LaborRate[]> {
    return this.laborRateRepository.find({
      where: { tenantId },
      order: { role: 'ASC', type: 'ASC', effectiveDate: 'DESC' },
    });
  }

  async findActiveLaborRates(tenantId: string): Promise<LaborRate[]> {
    return this.laborRateRepository.find({
      where: { tenantId, isActive: true },
      order: { role: 'ASC', type: 'ASC' },
    });
  }

  async findOneLaborRate(tenantId: string, rateId: string): Promise<LaborRate> {
    const rate = await this.laborRateRepository.findOne({
      where: { id: rateId, tenantId },
    });

    if (!rate) {
      throw new NotFoundException('Labor rate not found');
    }

    return rate;
  }

  async updateLaborRate(
    tenantId: string,
    rateId: string,
    dto: UpdateLaborRateDto,
  ): Promise<LaborRate> {
    const rate = await this.findOneLaborRate(tenantId, rateId);

    Object.assign(rate, dto);
    return this.laborRateRepository.save(rate);
  }

  async deleteLaborRate(tenantId: string, rateId: string): Promise<void> {
    const rate = await this.findOneLaborRate(tenantId, rateId);
    await this.laborRateRepository.softRemove(rate);
  }

  // ========== Time Tracking ==========

  async createTimeEntry(
    tenantId: string,
    userId: string,
    dto: CreateTimeEntryDto,
  ): Promise<TimeEntry> {
    const timeEntry = this.timeEntryRepository.create({
      ...dto,
      userId,
      tenantId,
    });

    // Calculate total cost if hours and rate provided
    if (dto.hours && dto.hourlyRate) {
      timeEntry.totalCost = dto.hours * dto.hourlyRate;
    }

    return this.timeEntryRepository.save(timeEntry);
  }

  async findTimeEntries(
    tenantId: string,
    filters?: { taskId?: string; laborItemId?: string; userId?: string },
  ): Promise<TimeEntry[]> {
    const where: any = { tenantId };
    if (filters?.taskId) where.taskId = filters.taskId;
    if (filters?.laborItemId) where.laborItemId = filters.laborItemId;
    if (filters?.userId) where.userId = filters.userId;

    return this.timeEntryRepository.find({
      where,
      relations: ['user', 'task', 'laborItem'],
      order: { startTime: 'DESC' },
    });
  }

  async findOneTimeEntry(
    tenantId: string,
    entryId: string,
  ): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({
      where: { id: entryId, tenantId },
      relations: ['user', 'task', 'laborItem'],
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found');
    }

    return entry;
  }

  async updateTimeEntry(
    tenantId: string,
    entryId: string,
    userId: string,
    dto: UpdateTimeEntryDto,
  ): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({
      where: { id: entryId, tenantId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found or access denied');
    }

    Object.assign(entry, dto);

    // Recalculate total cost if hours or rate changed
    if (entry.hours && entry.hourlyRate) {
      entry.totalCost = entry.hours * entry.hourlyRate;
    }

    return this.timeEntryRepository.save(entry);
  }

  async stopTimer(
    tenantId: string,
    entryId: string,
    userId: string,
  ): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({
      where: { id: entryId, tenantId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found or access denied');
    }

    if (entry.endTime) {
      throw new Error('Timer already stopped');
    }

    entry.endTime = new Date();
    entry.hours = entry.duration || 0;

    // Calculate total cost if rate provided
    if (entry.hourlyRate && entry.hours) {
      entry.totalCost = entry.hours * entry.hourlyRate;
    }

    return this.timeEntryRepository.save(entry);
  }

  async deleteTimeEntry(
    tenantId: string,
    entryId: string,
    userId: string,
  ): Promise<void> {
    const entry = await this.timeEntryRepository.findOne({
      where: { id: entryId, tenantId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Time entry not found or access denied');
    }

    await this.timeEntryRepository.softRemove(entry);
  }

  async getTaskTimeSummary(tenantId: string, taskId: string) {
    const entries = await this.timeEntryRepository.find({
      where: { tenantId, taskId },
    });

    const totalHours = entries.reduce((sum: number, entry) => {
      return sum + (entry.hours || entry.duration || 0);
    }, 0);

    const totalCost = entries.reduce((sum: number, entry) => {
      return sum + (entry.totalCost || entry.computedCost || 0);
    }, 0);

    return {
      taskId,
      entryCount: entries.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      entries,
    };
  }

  async getProjectLaborSummary(tenantId: string, projectId: string) {
    // Get all labor items for the project
    const laborItems = await this.laborRepository.find({
      where: { tenantId, projectId },
    });

    const totalEstimatedCost = laborItems.reduce((sum: number, item) => {
      return sum + Number(item.estimatedCost || 0);
    }, 0);

    const totalActualCost = laborItems.reduce((sum: number, item) => {
      return sum + Number(item.actualCost || 0);
    }, 0);

    const totalEstimatedHours = laborItems.reduce((sum: number, item) => {
      return sum + Number(item.estimatedHours || 0);
    }, 0);

    const totalActualHours = laborItems.reduce((sum: number, item) => {
      return sum + Number(item.actualHours || 0);
    }, 0);

    return {
      projectId,
      laborItemCount: laborItems.length,
      totalEstimatedHours: parseFloat(totalEstimatedHours.toFixed(2)),
      totalActualHours: parseFloat(totalActualHours.toFixed(2)),
      totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
      totalActualCost: parseFloat(totalActualCost.toFixed(2)),
      variance: parseFloat((totalActualCost - totalEstimatedCost).toFixed(2)),
      laborItems,
    };
  }
}
