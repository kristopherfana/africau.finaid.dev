import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipsController } from './scholarships.controller';

describe('ScholarshipsController', () => {
  let controller: ScholarshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScholarshipsController],
    }).compile();

    controller = module.get<ScholarshipsController>(ScholarshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
