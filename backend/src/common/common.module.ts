import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './services/tenant.service';
import { ActivityLogService } from './services/activity-log.service';
import { PermissionsService } from './services/permissions.service';
import { HealthController } from './health.controller';
import { ActivityLog } from './entities/activity-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [HealthController],
  providers: [TenantService, ActivityLogService, PermissionsService],
  exports: [TenantService, ActivityLogService, PermissionsService],
})
export class CommonModule {}
