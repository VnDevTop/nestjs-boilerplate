import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { HealthCheckService } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule.forRoot({
        gracefulShutdownTimeoutMs: 5000,
      })],
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: async () => ({
              status: 'up',
              uptime: 100,
              latency: 50,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('controller should have checkHealth method', () => {
    expect(controller.checkHealth).toBeDefined();
  });

  it('controller should have ready method', () => {
    expect(controller.ready).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', async () => {
      const result = await controller.checkHealth();
      expect(result).toEqual({
        status: 'up',
        uptime: 100,
        latency: 50,
      });
    });

    it('should return result with status property', () => {
      return expect(controller.checkHealth()).resolves.toHaveProperty('status', 'up');
    });

    it('should return result with uptime property', () => {
      return expect(controller.checkHealth()).resolves.toHaveProperty('uptime', 100);
    });

    it('should return result with latency property', () => {
      return expect(controller.checkHealth()).resolves.toHaveProperty('latency', 50);
    });
  });

  describe('ready', () => {
    it('should return health status', async () => {
      const result = await controller.ready();
      expect(result).toEqual({
        status: 'up',
        uptime: 100,
        latency: 50,
      });
    });

    it('should return result with status property', () => {
      return expect(controller.ready()).resolves.toHaveProperty('status', 'up');
    });

    it('should return result with uptime property', () => {
      return expect(controller.ready()).resolves.toHaveProperty('uptime', 100);
    });

    it('should return result with latency property', () => {
      return expect(controller.ready()).resolves.toHaveProperty('latency', 50);
    });
  });
});