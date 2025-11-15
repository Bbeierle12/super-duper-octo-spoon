import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangeOrder, ChangeOrderStatus } from './entities/change-order.entity';
import { CreateChangeOrderDto, UpdateChangeOrderDto } from './dto';

@Injectable()
export class ChangeOrdersService {
  constructor(
    @InjectRepository(ChangeOrder)
    private changeOrdersRepository: Repository<ChangeOrder>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createChangeOrderDto: CreateChangeOrderDto,
  ): Promise<ChangeOrder> {
    // Generate CO number
    const coNumber = await this.generateCONumber(tenantId);

    const changeOrder = this.changeOrdersRepository.create({
      ...createChangeOrderDto,
      coNumber,
      tenantId,
      requestedById: userId,
      requestedDate: createChangeOrderDto.requestedDate || new Date() as any,
    });

    return this.changeOrdersRepository.save(changeOrder);
  }

  async findAll(tenantId: string): Promise<ChangeOrder[]> {
    return this.changeOrdersRepository.find({
      where: { tenantId },
      relations: ['project', 'requestedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(tenantId: string, projectId: string): Promise<ChangeOrder[]> {
    return this.changeOrdersRepository.find({
      where: { tenantId, projectId },
      relations: ['requestedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<ChangeOrder> {
    const changeOrder = await this.changeOrdersRepository.findOne({
      where: { id, tenantId },
      relations: ['project', 'requestedBy', 'approvedBy'],
    });

    if (!changeOrder) {
      throw new NotFoundException(`Change Order with ID ${id} not found`);
    }

    return changeOrder;
  }

  async update(
    tenantId: string,
    id: string,
    updateChangeOrderDto: UpdateChangeOrderDto,
  ): Promise<ChangeOrder> {
    const changeOrder = await this.findOne(tenantId, id);

    // Prevent updating if already approved or implemented
    if (
      changeOrder.status === ChangeOrderStatus.APPROVED ||
      changeOrder.status === ChangeOrderStatus.IMPLEMENTED
    ) {
      throw new BadRequestException(
        'Cannot update change order that has been approved or implemented',
      );
    }

    Object.assign(changeOrder, updateChangeOrderDto);
    return this.changeOrdersRepository.save(changeOrder);
  }

  async approve(
    tenantId: string,
    id: string,
    approverId: string,
  ): Promise<ChangeOrder> {
    const changeOrder = await this.findOne(tenantId, id);

    if (changeOrder.status === ChangeOrderStatus.APPROVED) {
      throw new BadRequestException('Change order is already approved');
    }

    changeOrder.status = ChangeOrderStatus.APPROVED;
    changeOrder.approvedById = approverId;
    changeOrder.approvedDate = new Date() as any;

    return this.changeOrdersRepository.save(changeOrder);
  }

  async reject(
    tenantId: string,
    id: string,
    approverId: string,
    reason: string,
  ): Promise<ChangeOrder> {
    const changeOrder = await this.findOne(tenantId, id);

    if (changeOrder.status === ChangeOrderStatus.REJECTED) {
      throw new BadRequestException('Change order is already rejected');
    }

    changeOrder.status = ChangeOrderStatus.REJECTED;
    changeOrder.approvedById = approverId;
    changeOrder.approvedDate = new Date() as any;
    changeOrder.rejectionReason = reason;

    return this.changeOrdersRepository.save(changeOrder);
  }

  async implement(
    tenantId: string,
    id: string,
    implementationNotes?: string,
  ): Promise<ChangeOrder> {
    const changeOrder = await this.findOne(tenantId, id);

    if (changeOrder.status !== ChangeOrderStatus.APPROVED) {
      throw new BadRequestException('Only approved change orders can be implemented');
    }

    changeOrder.status = ChangeOrderStatus.IMPLEMENTED;
    changeOrder.implementedDate = new Date() as any;
    if (implementationNotes) {
      changeOrder.implementationNotes = implementationNotes;
    }

    return this.changeOrdersRepository.save(changeOrder);
  }

  async cancel(tenantId: string, id: string): Promise<ChangeOrder> {
    const changeOrder = await this.findOne(tenantId, id);

    if (changeOrder.status === ChangeOrderStatus.IMPLEMENTED) {
      throw new BadRequestException('Cannot cancel an implemented change order');
    }

    changeOrder.status = ChangeOrderStatus.CANCELLED;
    return this.changeOrdersRepository.save(changeOrder);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const changeOrder = await this.findOne(tenantId, id);

    if (changeOrder.status === ChangeOrderStatus.IMPLEMENTED) {
      throw new BadRequestException('Cannot delete an implemented change order');
    }

    await this.changeOrdersRepository.remove(changeOrder);
  }

  async getProjectSummary(tenantId: string, projectId: string) {
    const changeOrders = await this.findByProject(tenantId, projectId);

    const totalCount = changeOrders.length;
    const draftCount = changeOrders.filter(co => co.status === ChangeOrderStatus.DRAFT).length;
    const pendingCount = changeOrders.filter(
      co => co.status === ChangeOrderStatus.PENDING_APPROVAL,
    ).length;
    const approvedCount = changeOrders.filter(
      co => co.status === ChangeOrderStatus.APPROVED,
    ).length;
    const implementedCount = changeOrders.filter(
      co => co.status === ChangeOrderStatus.IMPLEMENTED,
    ).length;
    const rejectedCount = changeOrders.filter(
      co => co.status === ChangeOrderStatus.REJECTED,
    ).length;

    const totalBudgetImpact = changeOrders
      .filter(co => co.status === ChangeOrderStatus.IMPLEMENTED)
      .reduce((sum, co) => sum + Number(co.budgetImpact || 0), 0);

    const totalTimelineImpact = changeOrders
      .filter(co => co.status === ChangeOrderStatus.IMPLEMENTED)
      .reduce((sum, co) => sum + Number(co.timelineImpactDays || 0), 0);

    return {
      projectId,
      totalCount,
      draftCount,
      pendingCount,
      approvedCount,
      implementedCount,
      rejectedCount,
      totalBudgetImpact,
      totalTimelineImpact,
    };
  }

  private async generateCONumber(tenantId: string): Promise<string> {
    const count = await this.changeOrdersRepository.count({
      where: { tenantId },
    });

    const year = new Date().getFullYear();
    const coNum = (count + 1).toString().padStart(4, '0');

    return `CO-${year}-${coNum}`;
  }
}
