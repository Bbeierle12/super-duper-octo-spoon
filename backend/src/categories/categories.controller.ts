import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custom category' })
  create(@CurrentTenant() tenantId: string, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(tenantId, createCategoryDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all categories for a project' })
  findByProject(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.categoriesService.findByProject(tenantId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(tenantId, id);
  }
}
