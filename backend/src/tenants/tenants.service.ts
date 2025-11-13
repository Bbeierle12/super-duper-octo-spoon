import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantPlan } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      plan: TenantPlan.FREE,
      limits: {
        maxProjects: 3,
        maxUsers: 1,
        maxStorageMb: 100,
      },
    });

    return this.tenantsRepository.save(tenant);
  }

  async findOne(id: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({ where: { id } });
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    await this.tenantsRepository.update(id, updates);
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }
}
