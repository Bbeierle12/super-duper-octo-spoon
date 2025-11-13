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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChangeOrdersService } from './change-orders.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/services/permissions.service';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderDto } from './dto/update-change-order.dto';

@ApiTags('change-orders')
@Controller('change-orders')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class ChangeOrdersController {
  constructor(private readonly changeOrdersService: ChangeOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new change order' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateChangeOrderDto) {
    return this.changeOrdersService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all change orders' })
  @ApiQuery({ name: 'projectId', required: false })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.changeOrdersService.findAll(tenantId, projectId);
  }

  @Get(':coId')
  @ApiOperation({ summary: 'Get change order details' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findOne(@CurrentTenant() tenantId: string, @Param('coId') coId: string) {
    return this.changeOrdersService.findOne(tenantId, coId);
  }

  @Patch(':coId')
  @ApiOperation({ summary: 'Update change order (draft only)' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  update(
    @CurrentTenant() tenantId: string,
    @Param('coId') coId: string,
    @Body() dto: UpdateChangeOrderDto,
  ) {
    return this.changeOrdersService.update(tenantId, coId, dto);
  }

  @Post(':coId/submit')
  @ApiOperation({ summary: 'Submit change order for approval' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('coId') coId: string,
  ) {
    return this.changeOrdersService.submit(tenantId, coId, user.id);
  }

  @Post(':coId/approve')
  @ApiOperation({ summary: 'Approve change order' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('coId') coId: string,
  ) {
    return this.changeOrdersService.approve(tenantId, coId, user.id);
  }

  @Post(':coId/reject')
  @ApiOperation({ summary: 'Reject change order' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  reject(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('coId') coId: string,
    @Body('reason') reason: string,
  ) {
    return this.changeOrdersService.reject(tenantId, coId, user.id, reason);
  }

  @Post(':coId/implement')
  @ApiOperation({ summary: 'Mark change order as implemented' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  markImplemented(
    @CurrentTenant() tenantId: string,
    @Param('coId') coId: string,
  ) {
    return this.changeOrdersService.markImplemented(tenantId, coId);
  }

  @Delete(':coId')
  @ApiOperation({ summary: 'Delete change order (draft only)' })
  @RequirePermissions(Permission.MANAGE_PROJECTS)
  async delete(@CurrentTenant() tenantId: string, @Param('coId') coId: string) {
    await this.changeOrdersService.delete(tenantId, coId);
    return { message: 'Change order deleted successfully' };
  }
}
