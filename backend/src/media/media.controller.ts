import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentTenant, CurrentUser } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RequestUploadDto, CompleteUploadDto } from './dto/request-upload.dto';

@ApiTags('media')
@Controller('media')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all media for a project' })
  findByProject(@CurrentTenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.mediaService.findByProject(tenantId, projectId);
  }

  @Post('request-upload')
  @ApiOperation({ summary: 'Request signed upload URL for media' })
  requestUpload(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: RequestUploadDto,
  ) {
    return this.mediaService.requestUpload(tenantId, user.id, dto);
  }

  @Post('complete-upload/:projectId')
  @ApiOperation({ summary: 'Complete upload and create media record' })
  completeUpload(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.mediaService.completeUpload(tenantId, user.id, projectId, dto);
  }
}
