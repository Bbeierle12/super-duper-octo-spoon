import { ApiProperty } from '@nestjs/swagger';

export class BudgetHealthDto {
  @ApiProperty({ example: 5 })
  onBudget: number;

  @ApiProperty({ example: 2 })
  overBudget: number;

  @ApiProperty({ example: 3 })
  underBudget: number;
}

export class PortfolioMetricsDto {
  @ApiProperty({ example: 10 })
  totalProjects: number;

  @ApiProperty({ example: 7 })
  activeProjects: number;

  @ApiProperty({ example: 2 })
  completedProjects: number;

  @ApiProperty({ example: 1 })
  archivedProjects: number;

  @ApiProperty({ example: 500000 })
  totalBudget: number;

  @ApiProperty({ example: 325000 })
  totalSpent: number;

  @ApiProperty({ example: 175000 })
  totalRemaining: number;

  @ApiProperty({ type: BudgetHealthDto })
  budgetHealth: BudgetHealthDto;

  @ApiProperty({ example: 65.0 })
  portfolioCompletion: number; // % complete across all projects
}

export class CategoryVarianceDto {
  @ApiProperty({ example: 'Engine' })
  categoryName: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  categoryId: string;

  @ApiProperty({ example: 25000 })
  plannedBudget: number;

  @ApiProperty({ example: 27500 })
  actualSpent: number;

  @ApiProperty({ example: 2500 })
  variance: number;

  @ApiProperty({ example: 10.0 })
  variancePercent: number;

  @ApiProperty({ example: 'over' })
  status: 'over' | 'under' | 'on-budget';
}

export class BudgetVarianceDto {
  @ApiProperty({ example: 75000 })
  plannedBudget: number;

  @ApiProperty({ example: 68500 })
  actualSpent: number;

  @ApiProperty({ example: 6500 })
  remaining: number;

  @ApiProperty({ example: -6500 })
  variance: number;

  @ApiProperty({ example: -8.67 })
  variancePercent: number;

  @ApiProperty({ example: 'under' })
  budgetStatus: 'over' | 'under' | 'on-budget';

  @ApiProperty({ type: [CategoryVarianceDto] })
  categoryBreakdown: CategoryVarianceDto[];

  @ApiProperty({ example: 45000 })
  partsCost: number;

  @ApiProperty({ example: 23500 })
  laborCost: number;
}

export class TimelineStatusDto {
  @ApiProperty({ example: 12 })
  totalTasks: number;

  @ApiProperty({ example: 7 })
  completedTasks: number;

  @ApiProperty({ example: 3 })
  inProgressTasks: number;

  @ApiProperty({ example: 2 })
  notStartedTasks: number;

  @ApiProperty({ example: 1 })
  overdueTasks: number;

  @ApiProperty({ example: 58.3 })
  completionPercent: number;

  @ApiProperty({ example: '2024-06-15' })
  targetCompletionDate: string | null;

  @ApiProperty({ example: '2024-08-20' })
  projectedCompletionDate: string | null;

  @ApiProperty({ example: 66 })
  daysRemaining: number | null;

  @ApiProperty({ example: 'on-track' })
  timelineStatus: 'on-track' | 'at-risk' | 'delayed';
}

export class SpendingTrendDataDto {
  @ApiProperty({ example: '2024-01' })
  period: string; // YYYY-MM format

  @ApiProperty({ example: 15000 })
  partsCost: number;

  @ApiProperty({ example: 8500 })
  laborCost: number;

  @ApiProperty({ example: 23500 })
  total: number;

  @ApiProperty({ example: 3 })
  projectCount: number;
}

export class VendorPerformanceDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  vendorId: string;

  @ApiProperty({ example: 'Summit Racing' })
  vendorName: string;

  @ApiProperty({ example: 45000 })
  totalSpent: number;

  @ApiProperty({ example: 12 })
  orderCount: number;

  @ApiProperty({ example: 7.5 })
  avgDeliveryDays: number;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 38 })
  partCount: number;
}
