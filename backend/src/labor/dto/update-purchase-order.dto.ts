import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto extends PartialType(
  OmitType(CreatePurchaseOrderDto, ['vendorId', 'projectId', 'items'] as const),
) {}
