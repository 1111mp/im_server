import { Test, TestingModule } from '@nestjs/testing';
import { ElectronController } from './electron.controller';
import { ElectronService } from './electron.service';

describe('ElectronController', () => {
  let controller: ElectronController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectronController],
      providers: [{ provide: ElectronService, useValue: {} }],
    }).compile();

    controller = module.get<ElectronController>(ElectronController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
