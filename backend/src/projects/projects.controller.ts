import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ProjectsService } from './projects.service';
import { ExportService } from './services/export.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@CurrentTenant() tenantId: string, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(tenantId, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for current tenant' })
  findAll(@CurrentTenant() tenantId: string, @Query() paginationDto: PaginationDto) {
    return this.projectsService.findAll(tenantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project by ID' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get project statistics and budget analysis' })
  getStats(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.getStats(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(tenantId, id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project (soft delete)' })
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.remove(tenantId, id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a project' })
  archive(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.archive(tenantId, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore an archived project' })
  restore(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.restore(tenantId, id);
  }

  @Get(':id/export/csv')
  @ApiOperation({ summary: 'Export project parts to CSV' })
  async exportCSV(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportProjectToCSV(tenantId, id);
    const project = await this.projectsService.findOne(tenantId, id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}-export.csv"`);
    res.send(csv);
  }

  @Get(':id/export/summary')
  @ApiOperation({ summary: 'Export project summary as JSON' })
  async exportSummary(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.exportService.exportProjectSummary(tenantId, id);
  }
}
