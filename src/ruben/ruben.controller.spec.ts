import { Test, TestingModule } from '@nestjs/testing';
import { RubenController } from './ruben.controller';

describe('RubenController', () => {
  let controller: RubenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RubenController],
    }).compile();

    controller = module.get<RubenController>(RubenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
