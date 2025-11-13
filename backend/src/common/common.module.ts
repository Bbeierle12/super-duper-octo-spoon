import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './services/tenant.service';
import { ActivityLogService } from './services/activity-log.service';
import { PermissionsService } from './services/permissions.service';
import { EmailService } from './services/email.service';
import { HealthController } from './health.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { CommentsModule } from './comments.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog]), CommentsModule],
  controllers: [HealthController],
  providers: [TenantService, ActivityLogService, PermissionsService, EmailService],
  exports: [TenantService, ActivityLogService, PermissionsService, EmailService, CommentsModule],
})
export class CommonModule {}
