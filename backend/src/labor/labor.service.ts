import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaborItem } from './entities/labor-item.entity';

@Injectable()
export class LaborService {
  constructor(
    @InjectRepository(LaborItem)
    private laborRepository: Repository<LaborItem>,
  ) {}

  async findByProject(tenantId: string, projectId: string): Promise<LaborItem[]> {
    return this.laborRepository.find({
      where: { tenantId, projectId },
      relations: ['vendor'],
      order: { createdAt: 'DESC' },
    });
  }
}
