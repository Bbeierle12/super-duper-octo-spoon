import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaborService } from './labor.service';
import { LaborController } from './labor.controller';
import { LaborItem } from './entities/labor-item.entity';
import { Vendor } from './entities/vendor.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { LaborRate } from './entities/labor-rate.entity';
import { TimeEntry } from './entities/time-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LaborItem,
      Vendor,
      PurchaseOrder,
      PurchaseOrderItem,
      LaborRate,
      TimeEntry,
    ]),
  ],
  controllers: [LaborController],
  providers: [LaborService],
  exports: [LaborService],
})
export class LaborModule {}
