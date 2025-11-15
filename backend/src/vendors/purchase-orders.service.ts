import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemsRepository: Repository<PurchaseOrderItem>,
  ) {}

  async create(
    tenantId: string,
    createPurchaseOrderDto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const { items, ...poData } = createPurchaseOrderDto;

    // Generate PO number
    const poNumber = await this.generatePONumber(tenantId);

    // Calculate totals
    let subtotal = 0;
    const poItems = items.map((item) => {
      const lineTotal = item.unitPrice * item.quantityOrdered;
      subtotal += lineTotal;

      return this.purchaseOrderItemsRepository.create({
        ...item,
        lineTotal,
        tenantId,
        quantityReceived: item.quantityReceived || 0,
      });
    });

    const tax = poData.tax || 0;
    const shipping = poData.shipping || 0;
    const totalAmount = subtotal + tax + shipping;

    const purchaseOrder = this.purchaseOrdersRepository.create({
      ...poData,
      poNumber,
      subtotal,
      totalAmount,
      tenantId,
      items: poItems,
    });

    return this.purchaseOrdersRepository.save(purchaseOrder);
  }

  async findAll(tenantId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrdersRepository.find({
      where: { tenantId },
      relations: ['vendor', 'project', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(tenantId: string, projectId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrdersRepository.find({
      where: { tenantId, projectId },
      relations: ['vendor', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByVendor(tenantId: string, vendorId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrdersRepository.find({
      where: { tenantId, vendorId },
      relations: ['project', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<PurchaseOrder> {
    const po = await this.purchaseOrdersRepository.findOne({
      where: { id, tenantId },
      relations: ['vendor', 'project', 'items', 'items.part'],
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return po;
  }

  async update(
    tenantId: string,
    id: string,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(tenantId, id);
    const { items, ...poData } = updatePurchaseOrderDto;

    // Update PO fields
    Object.assign(po, poData);

    // If items are provided, update them
    if (items && items.length > 0) {
      // Remove old items
      if (po.items && po.items.length > 0) {
        await this.purchaseOrderItemsRepository.remove(po.items);
      }

      // Create new items
      let subtotal = 0;
      const newItems = items.map((item) => {
        const lineTotal = item.unitPrice * item.quantityOrdered;
        subtotal += lineTotal;

        return this.purchaseOrderItemsRepository.create({
          ...item,
          lineTotal,
          tenantId,
          purchaseOrderId: po.id,
          quantityReceived: item.quantityReceived || 0,
        });
      });

      po.items = newItems;
      po.subtotal = subtotal;
      po.totalAmount = subtotal + (po.tax || 0) + (po.shipping || 0);
    }

    return this.purchaseOrdersRepository.save(po);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(tenantId, id);
    po.status = status;

    // If marked as received, set actual delivery date if not set
    if (status === PurchaseOrderStatus.RECEIVED && !po.actualDeliveryDate) {
      po.actualDeliveryDate = new Date() as any;
    }

    return this.purchaseOrdersRepository.save(po);
  }

  async receiveItems(
    tenantId: string,
    id: string,
    itemId: string,
    quantityReceived: number,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(tenantId, id);
    const item = po.items?.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in PO`);
    }

    item.quantityReceived = quantityReceived;

    // Check if all items are fully received
    const allReceived = po.items?.every(
      (i) => i.quantityReceived >= i.quantityOrdered,
    );

    if (allReceived) {
      po.status = PurchaseOrderStatus.RECEIVED;
      if (!po.actualDeliveryDate) {
        po.actualDeliveryDate = new Date() as any;
      }
    } else {
      const anyReceived = po.items?.some((i) => i.quantityReceived > 0);
      if (anyReceived) {
        po.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
      }
    }

    return this.purchaseOrdersRepository.save(po);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const po = await this.findOne(tenantId, id);
    await this.purchaseOrdersRepository.remove(po);
  }

  private async generatePONumber(tenantId: string): Promise<string> {
    const count = await this.purchaseOrdersRepository.count({
      where: { tenantId },
    });

    const year = new Date().getFullYear();
    const poNum = (count + 1).toString().padStart(4, '0');

    return `PO-${year}-${poNum}`;
  }
}
