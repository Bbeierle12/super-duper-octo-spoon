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
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { CommentableType } from './entities/comment.entity';

@ApiTags('comments')
@Controller('comments')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  create(
    @CurrentTenant() tenantId: string,
    @Request() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.userId;
    return this.commentsService.create(tenantId, userId, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'Returns all comments' })
  @ApiQuery({ name: 'commentableType', enum: CommentableType, required: false })
  @ApiQuery({ name: 'commentableId', required: false })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('commentableType') commentableType?: CommentableType,
    @Query('commentableId') commentableId?: string,
  ) {
    if (commentableType && commentableId) {
      return this.commentsService.findByEntity(tenantId, commentableType, commentableId);
    }
    return this.commentsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({ status: 200, description: 'Returns the comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.commentsService.findOne(tenantId, id);
  }

  @Get(':id/thread')
  @ApiOperation({ summary: 'Get comment thread (comment and all replies)' })
  @ApiResponse({ status: 200, description: 'Returns the comment thread' })
  getThread(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.commentsService.getCommentThread(tenantId, id);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies to a comment' })
  @ApiResponse({ status: 200, description: 'Returns comment replies' })
  getReplies(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.commentsService.findReplies(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only edit own comments' })
  update(
    @CurrentTenant() tenantId: string,
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userId = req.user.userId;
    return this.commentsService.update(tenantId, id, userId, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own comments' })
  remove(
    @CurrentTenant() tenantId: string,
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    return this.commentsService.remove(tenantId, id, userId);
  }
}
