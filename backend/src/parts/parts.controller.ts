import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('parts')
@Controller('parts')
@UseGuards(AuthGuard('jwt'), TenantGuard)
@ApiBearerAuth()
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new part' })
  create(@CurrentTenant() tenantId: string, @Body() createPartDto: CreatePartDto) {
    return this.partsService.create(tenantId, createPartDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get all parts for a category' })
  findByCategory(@CurrentTenant() tenantId: string, @Param('categoryId') categoryId: string) {
    return this.partsService.findByCategory(tenantId, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific part' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.partsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a part' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return this.partsService.update(tenantId, id, updatePartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a part' })
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.partsService.remove(tenantId, id);
  }
}
