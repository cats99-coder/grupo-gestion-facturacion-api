import { Test, TestingModule } from '@nestjs/testing';
import { RubenService } from './ruben.service';

describe('RubenService', () => {
  let service: RubenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RubenService],
    }).compile();

    service = module.get<RubenService>(RubenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
