import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ProjectsModule } from './projects/projects.module';
import { CategoriesModule } from './categories/categories.module';
import { PartsModule } from './parts/parts.module';
import { LaborModule } from './labor/labor.module';
import { TasksModule } from './tasks/tasks.module';
import { MediaModule } from './media/media.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { VendorsModule } from './vendors/vendors.module';
import { ChangeOrdersModule } from './change-orders/change-orders.module';
import { CommentsModule } from './comments/comments.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60) * 1000,
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Database
    DatabaseModule,

    // Feature modules
    CommonModule,
    AuthModule,
    TenantsModule,
    ProjectsModule,
    CategoriesModule,
    PartsModule,
    LaborModule,
    TasksModule,
    MediaModule,
    AnalyticsModule,
    VendorsModule,
    ChangeOrdersModule,
    CommentsModule,
  ],
})
export class AppModule {}
