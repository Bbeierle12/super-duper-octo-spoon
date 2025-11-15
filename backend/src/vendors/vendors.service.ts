import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto, UpdateVendorDto } from './dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
  ) {}

  async create(tenantId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorsRepository.create({
      ...createVendorDto,
      tenantId,
    });

    return this.vendorsRepository.save(vendor);
  }

  async findAll(tenantId: string): Promise<Vendor[]> {
    return this.vendorsRepository.find({
      where: { tenantId },
      relations: ['purchaseOrders'],
      order: { name: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({
      where: { id, tenantId },
      relations: ['purchaseOrders'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(
    tenantId: string,
    id: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    const vendor = await this.findOne(tenantId, id);
    Object.assign(vendor, updateVendorDto);
    return this.vendorsRepository.save(vendor);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const vendor = await this.findOne(tenantId, id);
    await this.vendorsRepository.remove(vendor);
  }

  async searchByName(tenantId: string, searchTerm: string): Promise<Vendor[]> {
    return this.vendorsRepository
      .createQueryBuilder('vendor')
      .where('vendor.tenantId = :tenantId', { tenantId })
      .andWhere('vendor.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('vendor.name', 'ASC')
      .getMany();
  }

  async getVendorStats(tenantId: string, vendorId: string) {
    const vendor = await this.vendorsRepository.findOne({
      where: { id: vendorId, tenantId },
      relations: ['purchaseOrders', 'purchaseOrders.items'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    const totalOrders = vendor.purchaseOrders?.length || 0;
    const completedOrders = vendor.purchaseOrders?.filter(
      (po) => po.status === 'received',
    ).length || 0;
    const totalSpent = vendor.purchaseOrders?.reduce(
      (sum, po) => sum + Number(po.totalAmount || 0),
      0,
    ) || 0;

    // Calculate average delivery time for completed orders
    let avgDeliveryDays = 0;
    const deliveredOrders = vendor.purchaseOrders?.filter(
      (po) => po.actualDeliveryDate && po.orderDate,
    );
    if (deliveredOrders && deliveredOrders.length > 0) {
      const totalDays = deliveredOrders.reduce((sum, po) => {
        const orderDate = new Date(po.orderDate);
        const deliveryDate = new Date(po.actualDeliveryDate);
        const days = Math.ceil(
          (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }, 0);
      avgDeliveryDays = totalDays / deliveredOrders.length;
    }

    const totalItems = vendor.purchaseOrders?.reduce(
      (sum, po) => sum + (po.items?.length || 0),
      0,
    ) || 0;

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      totalOrders,
      completedOrders,
      totalSpent,
      avgDeliveryDays: Math.round(avgDeliveryDays * 10) / 10,
      rating: vendor.rating || 0,
      totalItems,
    };
  }
}
