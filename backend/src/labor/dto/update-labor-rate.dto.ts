import { PartialType } from '@nestjs/swagger';
import { CreateLaborRateDto } from './create-labor-rate.dto';

export class UpdateLaborRateDto extends PartialType(CreateLaborRateDto) {}
