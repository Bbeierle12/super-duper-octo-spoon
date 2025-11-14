import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/services/permissions.service';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from './dto';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('project/:projectId')
  @RequirePermissions(Permission.MANAGE_TASKS)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(tenantId, projectId, createTaskDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a project' })
  @ApiResponse({ status: 200, description: 'Returns all tasks' })
  findByProject(
    @CurrentTenant() tenantId: string,
    @Param('projectId') projectId: string,
    @Query() filters: FilterTasksDto,
  ) {
    return this.tasksService.findByProject(tenantId, projectId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiResponse({ status: 200, description: 'Returns the task' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tasksService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_TASKS)
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(tenantId, id, updateTaskDto);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.MANAGE_TASKS)
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.tasksService.updateStatus(tenantId, id, status);
  }

  @Patch(':id/assign')
  @RequirePermissions(Permission.ASSIGN_TASKS)
  @ApiOperation({ summary: 'Assign or unassign a task' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  assignTask(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('assignedToId') assignedToId: string | null,
  ) {
    return this.tasksService.assignTask(tenantId, id, assignedToId);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_TASKS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tasksService.remove(tenantId, id);
  }
}
