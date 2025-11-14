import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(
    tenantId: string,
    projectId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      tenantId,
      projectId,
    });

    return this.tasksRepository.save(task);
  }

  async findByProject(
    tenantId: string,
    projectId: string,
    filters?: FilterTasksDto,
  ): Promise<Task[]> {
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId })
      .andWhere('task.projectId = :projectId', { projectId });

    // Apply filters
    if (filters?.status) {
      queryBuilder.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters?.assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('task.category = :category', { category: filters.category });
    }

    if (filters?.dueDateFrom) {
      queryBuilder.andWhere('task.dueDate >= :dueDateFrom', {
        dueDateFrom: filters.dueDateFrom,
      });
    }

    if (filters?.dueDateTo) {
      queryBuilder.andWhere('task.dueDate <= :dueDateTo', {
        dueDateTo: filters.dueDateTo,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return queryBuilder
      .orderBy('task.sortOrder', 'ASC')
      .addOrderBy('task.createdAt', 'ASC')
      .getMany();
  }

  async findOne(tenantId: string, taskId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return task;
  }

  async update(
    tenantId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(tenantId, taskId);

    // Apply updates
    Object.assign(task, updateTaskDto);

    // If status is being updated to completed, set completedDate
    if (updateTaskDto.status === 'completed' && task.completedDate === null) {
      task.completedDate = new Date();
    }

    // If status is being changed from completed to something else, clear completedDate
    if (updateTaskDto.status && updateTaskDto.status !== 'completed' && task.completedDate !== null) {
      task.completedDate = null as any;
    }

    return this.tasksRepository.save(task);
  }

  async remove(tenantId: string, taskId: string): Promise<void> {
    const task = await this.findOne(tenantId, taskId);
    await this.tasksRepository.remove(task);
  }

  async updateStatus(
    tenantId: string,
    taskId: string,
    status: string,
  ): Promise<Task> {
    return this.update(tenantId, taskId, { status } as UpdateTaskDto);
  }

  async assignTask(
    tenantId: string,
    taskId: string,
    assignedToId: string | null,
  ): Promise<Task> {
    return this.update(tenantId, taskId, { assignedToId } as UpdateTaskDto);
  }
}
