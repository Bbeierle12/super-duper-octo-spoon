import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Category } from '../../categories/entities/category.entity';
import { Part } from '../../parts/entities/part.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Part)
    private partsRepository: Repository<Part>,
  ) {}

  async exportProjectToCSV(tenantId: string, projectId: string): Promise<string> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const categories = await this.categoriesRepository.find({
      where: { tenantId, projectId },
      relations: ['parts'],
      order: { sortOrder: 'ASC' },
    });

    // Build CSV
    const lines: string[] = [];

    // Header
    lines.push('Category,Part Name,Manufacturer,Part Number,Quantity,List Price,Negotiated Price,Actual Price,Shipping,Total Cost,Status,Vendor');

    // Data rows
    for (const category of categories) {
      if (category.parts && category.parts.length > 0) {
        for (const part of category.parts) {
          lines.push([
            this.escapeCSV(category.name),
            this.escapeCSV(part.name),
            this.escapeCSV(part.manufacturer || ''),
            this.escapeCSV(part.partNumber || ''),
            part.quantity,
            part.listPrice,
            part.negotiatedPrice || '',
            part.actualPrice || '',
            part.estimatedShipping || '',
            part.totalCost,
            part.status,
            this.escapeCSV(part.vendor || ''),
          ].join(','));
        }
      }
    }

    return lines.join('\n');
  }

  async exportProjectSummary(tenantId: string, projectId: string): Promise<any> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const categories = await this.categoriesRepository.find({
      where: { tenantId, projectId },
      relations: ['parts'],
      order: { sortOrder: 'ASC' },
    });

    const categoryBreakdown = categories.map((category) => {
      const partsTotal = category.parts?.reduce((sum, part) => sum + Number(part.totalCost), 0) || 0;

      return {
        category: category.name,
        budgetAllocated: Number(category.budgetAllocated),
        actualSpent: partsTotal,
        variance: partsTotal - Number(category.budgetAllocated),
        partsCount: category.parts?.length || 0,
      };
    });

    const totalSpent = categoryBreakdown.reduce((sum, cat) => sum + cat.actualSpent, 0);

    return {
      project: {
        name: project.name,
        vehicle: `${project.vehicleYear} ${project.vehicleMake} ${project.vehicleModel}`,
        status: project.status,
        goals: project.goals,
      },
      budget: {
        totalBudget: Number(project.totalBudget),
        vehiclePurchasePrice: Number(project.vehiclePurchasePrice),
        totalSpent,
        remaining: Number(project.totalBudget) - totalSpent,
      },
      categories: categoryBreakdown,
      generatedAt: new Date().toISOString(),
    };
  }

  private escapeCSV(value: string): string {
    if (!value) return '';

    // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }
}
