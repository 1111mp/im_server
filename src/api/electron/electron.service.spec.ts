import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { ElectronService } from './electron.service';
import { Electron as ElectronModel } from './models/electron.model';

describe('ElectronService', () => {
  let service: ElectronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectronService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => 'uploads/'),
          },
        },
        { provide: getModelToken(ElectronModel), useValue: {} },
      ],
    }).compile();

    service = module.get<ElectronService>(ElectronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
