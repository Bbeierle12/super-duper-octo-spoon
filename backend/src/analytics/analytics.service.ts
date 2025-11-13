import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { Category } from '../categories/entities/category.entity';
import { Part } from '../parts/entities/part.entity';
import { LaborItem } from '../labor/entities/labor-item.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import {
  PortfolioMetricsDto,
  BudgetVarianceDto,
  CategoryVarianceDto,
  TimelineStatusDto,
  SpendingTrendDataDto,
} from '../common/dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Part)
    private partsRepository: Repository<Part>,
    @InjectRepository(LaborItem)
    private laborRepository: Repository<LaborItem>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
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

  // ========== Phase 3: Advanced Analytics ==========

  async getPortfolioMetrics(tenantId: string): Promise<PortfolioMetricsDto> {
    const projects = await this.projectsRepository.find({
      where: { tenantId },
      relations: ['categories', 'categories.parts'],
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) =>
        p.status !== ProjectStatus.COMPLETED &&
        p.status !== ProjectStatus.ON_HOLD,
    ).length;
    const completedProjects = projects.filter((p) => p.status === ProjectStatus.COMPLETED).length;
    const archivedProjects = projects.filter((p) => p.deletedAt !== null).length;

    let totalBudget = 0;
    let totalSpent = 0;

    // Calculate total budget and spent using async method
    for (const project of projects) {
      totalBudget += project.totalBudget || 0;
      totalSpent += await this.calculateProjectSpent(project);
    }

    const totalRemaining = totalBudget - totalSpent;

    // Calculate budget health
    const budgetHealth = {
      onBudget: 0,
      overBudget: 0,
      underBudget: 0,
    };

    for (const project of projects) {
      const spent = await this.calculateProjectSpent(project);
      const budget = project.totalBudget || 0;
      const variance = spent - budget;
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;

      if (Math.abs(variancePercent) < 5) {
        budgetHealth.onBudget++;
      } else if (variancePercent > 0) {
        budgetHealth.overBudget++;
      } else {
        budgetHealth.underBudget++;
      }
    }

    const portfolioCompletion = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      archivedProjects,
      totalBudget,
      totalSpent,
      totalRemaining,
      budgetHealth,
      portfolioCompletion: parseFloat(portfolioCompletion.toFixed(2)),
    };
  }

  async getProjectBudgetVariance(
    tenantId: string,
    projectId: string,
  ): Promise<BudgetVarianceDto> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, tenantId },
      relations: ['categories', 'categories.parts'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const plannedBudget = project.totalBudget || 0;

    const partsCost =
      project.categories?.reduce((sum: number, category) => {
        const categoryPartsCost =
          category.parts?.reduce((partSum: number, part) => {
            return partSum + (part.actualPrice || part.listPrice || 0) * (part.quantity || 1);
          }, 0) || 0;
        return sum + categoryPartsCost;
      }, 0) || 0;

    // Query labor items separately since project.labor relation doesn't exist
    const laborItems = await this.laborRepository.find({
      where: { projectId, tenantId },
    });
    const laborCost = laborItems.reduce(
      (sum: number, labor) => sum + (labor.actualCost || labor.estimatedCost || 0),
      0,
    );

    const actualSpent = partsCost + laborCost;
    const remaining = plannedBudget - actualSpent;
    const variance = actualSpent - plannedBudget;
    const variancePercent = plannedBudget > 0 ? (variance / plannedBudget) * 100 : 0;

    let budgetStatus: 'over' | 'under' | 'on-budget';
    if (Math.abs(variancePercent) < 5) {
      budgetStatus = 'on-budget';
    } else if (variance > 0) {
      budgetStatus = 'over';
    } else {
      budgetStatus = 'under';
    }

    const categoryBreakdown: CategoryVarianceDto[] =
      project.categories?.map((category) => {
        const categoryPlanned = category.budgetAllocated || 0;
        const categoryActual =
          category.parts?.reduce((sum: number, part) => {
            return sum + (part.actualPrice || part.listPrice || 0) * (part.quantity || 1);
          }, 0) || 0;

        const catVariance = categoryActual - categoryPlanned;
        const catVariancePercent =
          categoryPlanned > 0 ? (catVariance / categoryPlanned) * 100 : 0;

        let catStatus: 'over' | 'under' | 'on-budget';
        if (Math.abs(catVariancePercent) < 5) {
          catStatus = 'on-budget';
        } else if (catVariance > 0) {
          catStatus = 'over';
        } else {
          catStatus = 'under';
        }

        return {
          categoryName: category.name,
          categoryId: category.id,
          plannedBudget: categoryPlanned,
          actualSpent: categoryActual,
          variance: catVariance,
          variancePercent: parseFloat(catVariancePercent.toFixed(2)),
          status: catStatus,
        };
      }) || [];

    return {
      plannedBudget,
      actualSpent,
      remaining,
      variance,
      variancePercent: parseFloat(variancePercent.toFixed(2)),
      budgetStatus,
      categoryBreakdown,
      partsCost,
      laborCost,
    };
  }

  async getProjectTimelineStatus(
    tenantId: string,
    projectId: string,
  ): Promise<TimelineStatusDto> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const tasks = await this.tasksRepository.find({
      where: { projectId },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const notStartedTasks = tasks.filter(
      (t) => t.status === TaskStatus.BACKLOG || t.status === TaskStatus.TODO,
    ).length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status === TaskStatus.COMPLETED) return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const targetCompletionDate = project.targetCompletionDate
      ? project.targetCompletionDate.toISOString().split('T')[0]
      : null;

    let projectedCompletionDate: string | null = null;
    let daysRemaining: number | null = null;
    let timelineStatus: 'on-track' | 'at-risk' | 'delayed' = 'on-track';

    if (project.targetCompletionDate) {
      const today = new Date();
      const target = new Date(project.targetCompletionDate);
      daysRemaining = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (completionPercent > 0) {
        const startDate = project.startDate || project.createdAt;
        const daysElapsed = Math.ceil((today.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        const projectedTotalDays = (daysElapsed / completionPercent) * 100;
        const projectedEnd = new Date(startDate);
        projectedEnd.setDate(projectedEnd.getDate() + projectedTotalDays);
        projectedCompletionDate = projectedEnd.toISOString().split('T')[0];

        if (projectedEnd > target) {
          const delayDays = Math.ceil((projectedEnd.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
          if (delayDays > 7) {
            timelineStatus = 'delayed';
          } else {
            timelineStatus = 'at-risk';
          }
        }
      }
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      overdueTasks,
      completionPercent: parseFloat(completionPercent.toFixed(1)),
      targetCompletionDate,
      projectedCompletionDate,
      daysRemaining,
      timelineStatus,
    };
  }

  async getSpendingTrends(
    tenantId: string,
    months: number = 6,
  ): Promise<SpendingTrendDataDto[]> {
    const projects = await this.projectsRepository.find({
      where: { tenantId },
      relations: ['categories', 'categories.parts'],
    });

    const trendMap = new Map<string, SpendingTrendDataDto>();

    const today = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trendMap.set(period, {
        period,
        partsCost: 0,
        laborCost: 0,
        total: 0,
        projectCount: 0,
      });
    }

    // Get all labor items for this tenant to calculate costs by project
    const allLaborItems = await this.laborRepository.find({
      where: { tenantId },
    });

    // Group labor items by project
    const laborByProject = new Map<string, LaborItem[]>();
    allLaborItems.forEach((labor) => {
      if (!laborByProject.has(labor.projectId)) {
        laborByProject.set(labor.projectId, []);
      }
      laborByProject.get(labor.projectId)!.push(labor);
    });

    projects.forEach((project) => {
      if (!project.createdAt) return;

      const projectDate = new Date(project.createdAt);
      const period = `${projectDate.getFullYear()}-${String(projectDate.getMonth() + 1).padStart(2, '0')}`;

      if (trendMap.has(period)) {
        const trend = trendMap.get(period)!;

        const partsCost =
          project.categories?.reduce((sum: number, category) => {
            const categoryPartsCost =
              category.parts?.reduce((partSum: number, part) => {
                return partSum + (part.actualPrice || part.listPrice || 0) * (part.quantity || 1);
              }, 0) || 0;
            return sum + categoryPartsCost;
          }, 0) || 0;

        const projectLabor = laborByProject.get(project.id) || [];
        const laborCost = projectLabor.reduce(
          (sum: number, labor) => sum + (labor.actualCost || labor.estimatedCost || 0),
          0,
        );

        trend.partsCost += partsCost;
        trend.laborCost += laborCost;
        trend.total += partsCost + laborCost;
        trend.projectCount++;
      }
    });

    return Array.from(trendMap.values());
  }

  private async calculateProjectSpent(project: Project): Promise<number> {
    const partsCost =
      project.categories?.reduce((sum: number, category) => {
        const categoryPartsCost =
          category.parts?.reduce((partSum: number, part) => {
            return partSum + (part.actualPrice || part.listPrice || 0) * (part.quantity || 1);
          }, 0) || 0;
        return sum + categoryPartsCost;
      }, 0) || 0;

    // Query labor items separately since project.labor relation doesn't exist
    const laborItems = await this.laborRepository.find({
      where: { projectId: project.id, tenantId: project.tenantId },
    });
    const laborCost = laborItems.reduce(
      (sum: number, labor) => sum + (labor.actualCost || labor.estimatedCost || 0),
      0,
    );

    return partsCost + laborCost;
  }
}
