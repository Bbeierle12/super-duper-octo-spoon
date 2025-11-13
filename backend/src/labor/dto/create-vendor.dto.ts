import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';
import { VendorType } from '../entities/vendor.entity';

export class CreateVendorDto {
  @ApiProperty({ example: 'Acme Parts Supply' })
  @IsString()
  name: string;

  @ApiProperty({ enum: VendorType, example: VendorType.PARTS_SUPPLIER })
  @IsEnum(VendorType)
  type: VendorType;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({ example: 'john@acmeparts.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '555-1234' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, ST 12345' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'https://acmeparts.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'Preferred vendor for suspension parts' })
  @IsString()
  @IsOptional()
  notes?: string;
}
