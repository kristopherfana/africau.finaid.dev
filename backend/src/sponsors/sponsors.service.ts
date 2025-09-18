import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private prisma: PrismaService) {}

  create(createSponsorDto: CreateSponsorDto) {
    return this.prisma.sponsor.create({ data: createSponsorDto });
  }

  findAll() {
    return this.prisma.sponsor.findMany();
  }

  findOne(id: string) {
    return this.prisma.sponsor.findUnique({ where: { id } });
  }

  update(id: string, updateSponsorDto: UpdateSponsorDto) {
    return this.prisma.sponsor.update({
      where: { id },
      data: updateSponsorDto,
    });
  }

  remove(id: string) {
    return this.prisma.sponsor.delete({ where: { id } });
  }
}
