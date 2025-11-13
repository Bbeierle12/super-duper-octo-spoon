import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangeOrder, ChangeOrderStatus } from './entities/change-order.entity';
import { ChangeOrderItem } from './entities/change-order-item.entity';
import { Project } from './entities/project.entity';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderDto } from './dto/update-change-order.dto';

@Injectable()
export class ChangeOrdersService {
  constructor(
    @InjectRepository(ChangeOrder)
    private changeOrderRepository: Repository<ChangeOrder>,
    @InjectRepository(ChangeOrderItem)
    private changeOrderItemRepository: Repository<ChangeOrderItem>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateChangeOrderDto,
  ): Promise<ChangeOrder> {
    // Verify project exists
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Generate CO number
    const count = await this.changeOrderRepository.count({ where: { tenantId } });
    const coNumber = `CO-${String(count + 1).padStart(4, '0')}`;

    // Create change order
    const changeOrder = this.changeOrderRepository.create({
      ...dto,
      coNumber,
      tenantId,
      status: ChangeOrderStatus.DRAFT,
    });

    const savedCO = await this.changeOrderRepository.save(changeOrder);

    // Create items
    const items = dto.items.map((item) =>
      this.changeOrderItemRepository.create({
        ...item,
        changeOrderId: savedCO.id,
        tenantId,
      }),
    );

    await this.changeOrderItemRepository.save(items);

    return this.findOne(tenantId, savedCO.id);
  }

  async findAll(tenantId: string, projectId?: string): Promise<ChangeOrder[]> {
    const where: any = { tenantId };
    if (projectId) {
      where.projectId = projectId;
    }

    return this.changeOrderRepository.find({
      where,
      relations: ['items', 'project'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, coId: string): Promise<ChangeOrder> {
    const co = await this.changeOrderRepository.findOne({
      where: { id: coId, tenantId },
      relations: ['items', 'project'],
    });

    if (!co) {
      throw new NotFoundException('Change order not found');
    }

    return co;
  }

  async update(
    tenantId: string,
    coId: string,
    dto: UpdateChangeOrderDto,
  ): Promise<ChangeOrder> {
    const co = await this.findOne(tenantId, coId);

    if (co.status !== ChangeOrderStatus.DRAFT) {
      throw new BadRequestException('Can only update draft change orders');
    }

    Object.assign(co, dto);
    await this.changeOrderRepository.save(co);

    return this.findOne(tenantId, coId);
  }

  async submit(
    tenantId: string,
    coId: string,
    userId: string,
  ): Promise<ChangeOrder> {
    const co = await this.findOne(tenantId, coId);

    if (co.status !== ChangeOrderStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft change orders');
    }

    co.status = ChangeOrderStatus.SUBMITTED;
    co.submittedAt = new Date();
    co.submittedById = userId;

    await this.changeOrderRepository.save(co);

    return this.findOne(tenantId, coId);
  }

  async approve(
    tenantId: string,
    coId: string,
    userId: string,
  ): Promise<ChangeOrder> {
    const co = await this.findOne(tenantId, coId);

    if (co.status !== ChangeOrderStatus.SUBMITTED) {
      throw new BadRequestException('Can only approve submitted change orders');
    }

    co.status = ChangeOrderStatus.APPROVED;
    co.approvedAt = new Date();
    co.approvedById = userId;

    await this.changeOrderRepository.save(co);

    // Auto-adjust project budget
    const project = await this.projectRepository.findOne({
      where: { id: co.projectId, tenantId },
    });

    if (project) {
      project.totalBudget = Number(project.totalBudget) + Number(co.budgetImpact);
      await this.projectRepository.save(project);
    }

    return this.findOne(tenantId, coId);
  }

  async reject(
    tenantId: string,
    coId: string,
    userId: string,
    reason: string,
  ): Promise<ChangeOrder> {
    const co = await this.findOne(tenantId, coId);

    if (co.status !== ChangeOrderStatus.SUBMITTED) {
      throw new BadRequestException('Can only reject submitted change orders');
    }

    co.status = ChangeOrderStatus.REJECTED;
    co.rejectedAt = new Date();
    co.rejectionReason = reason;

    await this.changeOrderRepository.save(co);

    return this.findOne(tenantId, coId);
  }

  async markImplemented(
    tenantId: string,
    coId: string,
  ): Promise<ChangeOrder> {
    const co = await this.findOne(tenantId, coId);

    if (co.status !== ChangeOrderStatus.APPROVED) {
      throw new BadRequestException('Can only implement approved change orders');
    }

    co.status = ChangeOrderStatus.IMPLEMENTED;

    await this.changeOrderRepository.save(co);

    return this.findOne(tenantId, coId);
  }

  async delete(tenantId: string, coId: string): Promise<void> {
    const co = await this.findOne(tenantId, coId);

    if (co.status !== ChangeOrderStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft change orders');
    }

    await this.changeOrderRepository.softRemove(co);
  }
}
