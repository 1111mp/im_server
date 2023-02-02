import { Test, TestingModule } from '@nestjs/testing';
import { ProtoService } from './proto.service';

describe('ProtoService', () => {
  let service: ProtoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtoService],
    }).compile();

    service = module.get<ProtoService>(ProtoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
