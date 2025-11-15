import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { VendorsController } from './vendors.controller';
import { Vendor } from './entities/vendor.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, PurchaseOrder, PurchaseOrderItem]),
    CommonModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService, PurchaseOrdersService],
  exports: [VendorsService, PurchaseOrdersService],
})
export class VendorsModule {}
