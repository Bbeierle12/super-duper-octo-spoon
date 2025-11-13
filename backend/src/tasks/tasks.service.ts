import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async findByProject(tenantId: string, projectId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { tenantId, projectId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }
}
