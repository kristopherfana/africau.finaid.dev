import { Module } from '@nestjs/common';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';

@Module({
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService]
})
export class ScholarshipsModule {}
