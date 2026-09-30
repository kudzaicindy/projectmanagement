import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePropertyDto, @Req() req: { user: { id: string } }) {
    return this.propertiesService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('PM', 'ADMIN', 'CEO')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.propertiesService.update(id, dto, req.user.id);
  }
}
