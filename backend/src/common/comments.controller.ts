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
import { CommentsService, CreateCommentDto, UpdateCommentDto } from './comments.service';
import { CurrentTenant } from './decorators/tenant.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { TenantGuard } from './guards/tenant.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { Permission } from './services/permissions.service';
import { CommentEntityType } from './entities/comment.entity';

@ApiTags('comments')
@Controller('comments')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get comments for an entity' })
  @ApiQuery({ name: 'entityType', enum: CommentEntityType })
  @ApiQuery({ name: 'entityId' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findByEntity(
    @CurrentTenant() tenantId: string,
    @Query('entityType') entityType: CommentEntityType,
    @Query('entityId') entityId: string,
  ) {
    return this.commentsService.findByEntity(tenantId, entityType, entityId);
  }

  @Get(':commentId')
  @ApiOperation({ summary: 'Get comment details' })
  @RequirePermissions(Permission.VIEW_PROJECTS)
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.findOne(tenantId, commentId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Update comment' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(tenantId, commentId, user.id, dto);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete comment' })
  @RequirePermissions(Permission.MANAGE_TASKS)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('commentId') commentId: string,
  ) {
    await this.commentsService.delete(tenantId, commentId, user.id);
    return { message: 'Comment deleted successfully' };
  }
}
