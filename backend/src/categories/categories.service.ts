import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_CATEGORIES = [
  { name: 'Chassis', type: CategoryType.CHASSIS, sortOrder: 1 },
  { name: 'Suspension', type: CategoryType.SUSPENSION, sortOrder: 2 },
  { name: 'Engine', type: CategoryType.ENGINE, sortOrder: 3 },
  { name: 'Drivetrain', type: CategoryType.DRIVETRAIN, sortOrder: 4 },
  { name: 'Brakes', type: CategoryType.BRAKES, sortOrder: 5 },
  { name: 'Body & Paint', type: CategoryType.BODY_PAINT, sortOrder: 6 },
  { name: 'Interior', type: CategoryType.INTERIOR, sortOrder: 7 },
  { name: 'Electrical', type: CategoryType.ELECTRICAL, sortOrder: 8 },
  { name: 'Wheels & Tires', type: CategoryType.WHEELS_TIRES, sortOrder: 9 },
  { name: 'Fuel System', type: CategoryType.FUEL, sortOrder: 10 },
  { name: 'Cooling', type: CategoryType.COOLING, sortOrder: 11 },
  { name: 'Exhaust', type: CategoryType.EXHAUST, sortOrder: 12 },
  { name: 'Safety', type: CategoryType.SAFETY, sortOrder: 13 },
];

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async createDefaultCategories(tenantId: string, projectId: string): Promise<Category[]> {
    const categories = DEFAULT_CATEGORIES.map((cat) =>
      this.categoriesRepository.create({
        ...cat,
        tenantId,
        projectId,
      }),
    );

    return this.categoriesRepository.save(categories);
  }

  async create(tenantId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      tenantId,
    });

    return this.categoriesRepository.save(category);
  }

  async findByProject(tenantId: string, projectId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { tenantId, projectId },
      relations: ['parts'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, tenantId },
      relations: ['parts'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateBudget(tenantId: string, id: string, budgetAllocated: number): Promise<Category> {
    const category = await this.findOne(tenantId, id);
    category.budgetAllocated = budgetAllocated;
    return this.categoriesRepository.save(category);
  }
}
