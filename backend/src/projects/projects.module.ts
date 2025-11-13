import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ChangeOrdersService } from './change-orders.service';
import { ChangeOrdersController } from './change-orders.controller';
import { ExportService } from './services/export.service';
import { Project } from './entities/project.entity';
import { ChangeOrder } from './entities/change-order.entity';
import { ChangeOrderItem } from './entities/change-order-item.entity';
import { Category } from '../categories/entities/category.entity';
import { Part } from '../parts/entities/part.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Category,
      Part,
      ChangeOrder,
      ChangeOrderItem,
    ]),
  ],
  controllers: [ProjectsController, ChangeOrdersController],
  providers: [ProjectsService, ChangeOrdersService, ExportService],
  exports: [ProjectsService, ChangeOrdersService],
})
export class ProjectsModule {}
