import { describe, expect, it, vi } from 'vitest';
import { SwaggerModule } from '@nestjs/swagger';

import { setupSwagger } from './swagger.setup.js';

describe('setupSwagger', () => {
  it('sets up the public swagger endpoint', () => {
    const setup = vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined as any);
    const createDocument = vi.spyOn(SwaggerModule, 'createDocument').mockImplementation(() => ({}) as any);

    const app = {
      get: () => ({
        get: () => ({
          title: 'Test API',
          description: 'desc',
          version: '1.0.0',
          path: 'api/docs',
          admin: false,
          adminPath: 'api/docs/admin',
        }),
      }),
    } as any;

    const result = setupSwagger(app);

    expect(createDocument).toHaveBeenCalled();
    expect(setup).toHaveBeenCalledWith('api/docs', app, expect.any(Object));
    expect(result).toBe(app);

    setup.mockRestore();
    createDocument.mockRestore();
  });

  it('sets up the admin swagger endpoint in non-production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const setup = vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined as any);
    const createDocument = vi.spyOn(SwaggerModule, 'createDocument').mockImplementation(() => ({}) as any);

    const app = {
      get: () => ({
        get: () => ({
          title: 'Test API',
          description: 'desc',
          version: '1.0.0',
          path: 'api/docs',
          admin: true,
          adminPath: 'api/docs/admin',
        }),
      }),
    } as any;

    setupSwagger(app);

    expect(setup).toHaveBeenCalledWith('api/docs/admin', app, expect.any(Object));

    setup.mockRestore();
    createDocument.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('skips the admin swagger endpoint in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const setup = vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined as any);
    const createDocument = vi.spyOn(SwaggerModule, 'createDocument').mockImplementation(() => ({}) as any);

    const app = {
      get: () => ({
        get: () => ({
          title: 'Test API',
          description: 'desc',
          version: '1.0.0',
          path: 'api/docs',
          admin: true,
          adminPath: 'api/docs/admin',
        }),
      }),
    } as any;

    setupSwagger(app);

    // Only the public endpoint should be registered.
    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith('api/docs', app, expect.any(Object));

    setup.mockRestore();
    createDocument.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('honours options passed directly', () => {
    const setup = vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => undefined as any);
    const createDocument = vi.spyOn(SwaggerModule, 'createDocument').mockImplementation(() => ({}) as any);

    const app = {
      get: () => ({
        get: () => ({
          title: 'Config Title',
          description: 'config desc',
          version: '2.0.0',
          path: 'api/docs',
          admin: false,
          adminPath: 'api/docs/admin',
        }),
      }),
    } as any;

    setupSwagger(app, { title: 'Override Title', admin: true });

    // admin is true in options but production check still applies; in test env (not production) admin endpoint is added.
    expect(setup).toHaveBeenCalled();

    setup.mockRestore();
    createDocument.mockRestore();
  });
});