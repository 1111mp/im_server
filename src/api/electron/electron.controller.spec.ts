import { Test, TestingModule } from '@nestjs/testing';
import { ElectronController } from './electron.controller';

describe('ElectronController', () => {
  let controller: ElectronController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectronController],
    }).compile();

    controller = module.get<ElectronController>(ElectronController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
