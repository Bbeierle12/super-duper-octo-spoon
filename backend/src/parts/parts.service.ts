import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private partsRepository: Repository<Part>,
  ) {}

  async create(tenantId: string, createPartDto: CreatePartDto): Promise<Part> {
    const part = this.partsRepository.create({
      ...createPartDto,
      tenantId,
    });

    return this.partsRepository.save(part);
  }

  async findByCategory(tenantId: string, categoryId: string): Promise<Part[]> {
    return this.partsRepository.find({
      where: { tenantId, categoryId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Part> {
    const part = await this.partsRepository.findOne({
      where: { id, tenantId },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    return part;
  }

  async update(tenantId: string, id: string, updatePartDto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(tenantId, id);
    Object.assign(part, updatePartDto);
    return this.partsRepository.save(part);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const part = await this.findOne(tenantId, id);
    await this.partsRepository.softRemove(part);
  }
}
