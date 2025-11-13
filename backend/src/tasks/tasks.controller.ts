import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('project/:projectId')
  findByProject(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.tasksService.findByProject(tenantId, projectId);
  }
}
