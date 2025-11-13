import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Category } from '../categories/entities/category.entity';
import { Part } from '../parts/entities/part.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Part)
    private partsRepository: Repository<Part>,
  ) {}

  async getDashboard(tenantId: string) {
    const projects = await this.projectsRepository.find({
      where: { tenantId },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status !== 'completed' && p.status !== 'on_hold').length;
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.totalBudget), 0);
    const totalSpent = projects.reduce((sum, p) => sum + Number(p.totalSpent), 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects: projects.filter((p) => p.status === 'completed').length,
      totalBudget,
      totalSpent,
      budgetRemaining: totalBudget - totalSpent,
    };
  }

  async getProjectBreakdown(tenantId: string, projectId: string) {
    const categories = await this.categoriesRepository.find({
      where: { tenantId, projectId },
      relations: ['parts'],
    });

    const breakdown = categories.map((category) => {
      const partsCost = category.parts?.reduce((sum, part) => sum + Number(part.totalCost), 0) || 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        budgetAllocated: Number(category.budgetAllocated),
        actualSpent: partsCost,
        variance: partsCost - Number(category.budgetAllocated),
        partsCount: category.parts?.length || 0,
      };
    });

    return breakdown;
  }
}
