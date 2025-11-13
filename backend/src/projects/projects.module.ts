import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ExportService } from './services/export.service';
import { Project } from './entities/project.entity';
import { Category } from '../categories/entities/category.entity';
import { Part } from '../parts/entities/part.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Category, Part])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ExportService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
