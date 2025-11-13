import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(tenantId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      tenantId,
    });

    return this.projectsRepository.save(project);
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Project>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [projects, total] = await this.projectsRepository.findAndCount({
      where: { tenantId },
      relations: ['categories', 'tasks', 'media'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(projects, total, page, limit);
  }

  async findOne(tenantId: string, id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id, tenantId },
      relations: ['categories', 'tasks', 'media'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    tenantId: string,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(tenantId, id);

    Object.assign(project, updateProjectDto);

    return this.projectsRepository.save(project);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const project = await this.findOne(tenantId, id);
    await this.projectsRepository.softRemove(project);
  }

  async archive(tenantId: string, id: string): Promise<Project> {
    const project = await this.findOne(tenantId, id);

    // Soft delete archives the project
    await this.projectsRepository.softRemove(project);

    return project;
  }

  async restore(tenantId: string, id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id, tenantId },
      withDeleted: true, // Include soft-deleted records
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.deletedAt) {
      throw new ForbiddenException('Project is not archived');
    }

    await this.projectsRepository.restore(id);

    return this.findOne(tenantId, id);
  }

  async getStats(tenantId: string, id: string) {
    const project = await this.findOne(tenantId, id);

    const totalPlanned = await this.calculateTotalPlannedCost(id);
    const totalActual = Number(project.totalSpent);
    const budgetRemaining = Number(project.totalBudget) - totalActual;
    const percentComplete = this.calculatePercentComplete(project);

    return {
      projectId: id,
      totalBudget: Number(project.totalBudget),
      totalPlanned,
      totalActual,
      budgetRemaining,
      budgetVariance: totalActual - totalPlanned,
      percentComplete,
      status: project.status,
    };
  }

  private async calculateTotalPlannedCost(projectId: string): Promise<number> {
    // This would sum up all parts' projected costs
    // Implementation depends on parts being loaded
    return 0; // Placeholder
  }

  private calculatePercentComplete(project: Project): number {
    // Simple status-based calculation
    const statusWeights = {
      [ProjectStatus.PLANNING]: 5,
      [ProjectStatus.TEARDOWN]: 15,
      [ProjectStatus.MOCK_UP]: 30,
      [ProjectStatus.FABRICATION]: 50,
      [ProjectStatus.PAINT]: 70,
      [ProjectStatus.ASSEMBLY]: 85,
      [ProjectStatus.TUNING]: 95,
      [ProjectStatus.COMPLETED]: 100,
      [ProjectStatus.ON_HOLD]: 0,
    };

    return statusWeights[project.status] || 0;
  }
}
