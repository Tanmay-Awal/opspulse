import { Test, TestingModule } from '@nestjs/testing';
import { RemediationController } from './remediation.controller';

describe('RemediationController', () => {
  let controller: RemediationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemediationController],
    }).compile();

    controller = module.get<RemediationController>(RemediationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
