import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './services/tenant.service';
import { ActivityLogService } from './services/activity-log.service';
import { PermissionsService } from './services/permissions.service';
import { EmailService } from './services/email.service';
import { ActivityFeedService } from './activity-feed.service';
import { HealthController } from './health.controller';
import { ActivityFeedController } from './activity-feed.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityFeed } from './entities/activity-feed.entity';
import { CommentsModule } from './comments.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog, ActivityFeed]), CommentsModule],
  controllers: [HealthController, ActivityFeedController],
  providers: [
    TenantService,
    ActivityLogService,
    PermissionsService,
    EmailService,
    ActivityFeedService,
  ],
  exports: [
    TenantService,
    ActivityLogService,
    PermissionsService,
    EmailService,
    ActivityFeedService,
    CommentsModule,
  ],
})
export class CommonModule {}
