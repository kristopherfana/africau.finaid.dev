import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('sponsors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Post()
  create(@Body() createSponsorDto: CreateSponsorDto) {
    return this.sponsorsService.create(createSponsorDto);
  }

  @Get()
  findAll() {
    return this.sponsorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sponsorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSponsorDto: UpdateSponsorDto) {
    return this.sponsorsService.update(id, updateSponsorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sponsorsService.remove(id);
  }
}
