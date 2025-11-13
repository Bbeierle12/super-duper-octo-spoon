import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateChangeOrderDto } from './create-change-order.dto';

export class UpdateChangeOrderDto extends PartialType(
  OmitType(CreateChangeOrderDto, ['projectId', 'items'] as const),
) {}
