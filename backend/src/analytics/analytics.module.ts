import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Project } from '../projects/entities/project.entity';
import { Category } from '../categories/entities/category.entity';
import { Part } from '../parts/entities/part.entity';
import { LaborItem } from '../labor/entities/labor-item.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Category, Part, LaborItem, Task])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
