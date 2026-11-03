import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { appConfig } from './app.config.js';
import { cacheConfig } from './cache.config.js';
import { corsConfig } from './cors.config.js';
import { databaseConfig } from './database.config.js';
import { i18nConfig } from './i18n.config.js';
import { mailConfig } from './mail.config.js';
import { observeConfig } from './observe.config.js';
import { queueConfig } from './queue.config.js';
import { securityHeaderConfig } from './security-header.config.js';
import { swaggerConfig } from './swagger.config.js';
import { throttleConfig } from './throttle.config.js';
import { validateEnv } from './env.validation.js';

describe('config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    delete process.env.PORT;
    // Start from a clean, minimal environment for deterministic config output.
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('APP_') ||
          key.startsWith('API_') ||
          key.startsWith('DATABASE_') ||
          key.startsWith('REDIS_') ||
          key.startsWith('CACHE_') ||
          key.startsWith('QUEUE_') ||
          key.startsWith('MAIL_') ||
          key.startsWith('I18N_') ||
          key.startsWith('DB_') ||
          key.startsWith('OBSERVE_') ||
          key.startsWith('SWAGGER_') ||
          key.startsWith('THROTTLE_') ||
          key.startsWith('CORS_')) {
        delete process.env[key];
      }
    }
  });

  afterEach(() => {
    // Restore the original environment after each test.
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value !== undefined) {
        process.env[key] = value as string;
      }
    }
  });

  describe('validateEnv', () => {
    it('returns validated data for a valid environment', () => {
      const result = validateEnv({ NODE_ENV: 'test', PORT: '3001' });
      expect(result.NODE_ENV).toBe('test');
      expect(result.PORT).toBe(3001);
    });

    it('applies defaults for optional fields', () => {
      const result = validateEnv({});
      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3000);
      expect(result.CACHE_TTL).toBe(300);
    });

    it('throws when an environment variable is invalid', () => {
      expect(() => validateEnv({ PORT: 'not-a-number' })).toThrow();
    });

    it('throws when NODE_ENV is not allowed', () => {
      expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow();
    });
  });

  describe('appConfig', () => {
    it('returns application configuration with defaults', () => {
      const config = appConfig() as any;
      expect(config.nodeEnv).toBe('development');
      expect(config.name).toBe('nestjs-boilerplate');
      expect(config.port).toBe(3000);
      expect(config.globalPrefix).toBe('api');
      expect(config.version).toBe('1');
      expect(config.url).toBe('http://localhost:3000');
    });

    it('reflects environment overrides', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_NAME = 'my-app';
      process.env.PORT = '8080';
      process.env.API_PREFIX = 'v2';
      process.env.API_VERSION = '2';
      process.env.APP_URL = 'https://example.com/';

      const config = appConfig() as any;
      expect(config.nodeEnv).toBe('production');
      expect(config.name).toBe('my-app');
      expect(config.port).toBe(8080);
      expect(config.globalPrefix).toBe('v2');
      expect(config.version).toBe('2');
      expect(config.url).toBe('https://example.com');
    });
  });

  describe('cacheConfig', () => {
    it('returns cache configuration', () => {
      const config = cacheConfig() as any;
      expect(config.isGlobal).toBe(true);
      expect(config.ttl).toBe(300);
      expect(Array.isArray(config.stores)).toBe(true);
    });
  });

  describe('corsConfig', () => {
    it('returns permissive defaults when no origin is set', () => {
      const config = corsConfig() as any;
      expect(config.origin).toBe(true);
      expect(config.credentials).toBe(false);
      expect(config.optionsSuccessStatus).toBe(204);
    });

    it('parses a single origin from the environment', () => {
      process.env.CORS_ORIGIN = 'https://example.com';
      const config = corsConfig() as any;
      expect(config.origin).toBe('https://example.com');
    });

    it('parses multiple origins from the environment', () => {
      process.env.CORS_ORIGIN = 'https://a.com, https://b.com';
      const config = corsConfig() as any;
      expect(config.origin).toEqual(['https://a.com', 'https://b.com']);
    });

    it('supports wildcard origin', () => {
      process.env.CORS_ORIGIN = '*';
      const config = corsConfig() as any;
      expect(config.origin).toBe('*');
    });

    it('reflects the request origin when CORS_ORIGIN is true', () => {
      process.env.CORS_ORIGIN = 'true';
      const config = corsConfig() as any;
      expect(config.origin).toBe(true);
    });

    it('defaults to reflecting the origin when CORS_ORIGIN is empty', () => {
      process.env.CORS_ORIGIN = '   ';
      const config = corsConfig() as any;
      expect(config.origin).toBe(true);
    });

    it('defaults to reflecting the origin when CORS_ORIGIN is an empty list', () => {
      process.env.CORS_ORIGIN = ' , , ';
      const config = corsConfig() as any;
      expect(config.origin).toBe(true);
    });

    it('parses allowed methods from the environment', () => {
      process.env.CORS_METHODS = 'GET, POST';
      const config = corsConfig() as any;
      expect(config.methods).toEqual(['GET', 'POST']);
    });

    it('uses default methods when CORS_METHODS is not set', () => {
      const config = corsConfig() as any;
      expect(config.methods).toBe('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    });

    it('parses allowed headers from the environment', () => {
      process.env.CORS_ALLOWED_HEADERS = 'Content-Type, Authorization';
      const config = corsConfig() as any;
      expect(config.allowedHeaders).toEqual(['Content-Type', 'Authorization']);
    });

    it('leaves allowed headers undefined when not set', () => {
      const config = corsConfig() as any;
      expect(config.allowedHeaders).toBeUndefined();
    });

    it('parses exposed headers from the environment', () => {
      process.env.CORS_EXPOSED_HEADERS = 'X-Total-Count';
      const config = corsConfig() as any;
      expect(config.exposedHeaders).toEqual(['X-Total-Count']);
    });

    it('leaves exposed headers undefined when not set', () => {
      const config = corsConfig() as any;
      expect(config.exposedHeaders).toBeUndefined();
    });

    it('enables credentials when requested', () => {
      process.env.CORS_CREDENTIALS = 'true';
      const config = corsConfig() as any;
      expect(config.credentials).toBe(true);
    });

    it('parses max age from the environment', () => {
      (process.env as any).CORS_MAX_AGE = '3600';
      const config = corsConfig() as any;
      expect(config.maxAge).toBe(3600);
    });

    it('leaves max age undefined when not set', () => {
      const config = corsConfig() as any;
      expect(config.maxAge).toBeUndefined();
    });

    it('enables preflight continue when requested', () => {
      process.env.CORS_PREFLIGHT_CONTINUE = 'true';
      const config = corsConfig() as any;
      expect(config.preflightContinue).toBe(true);
    });

    it('parses options success status from the environment', () => {
      (process.env as any).CORS_OPTIONS_SUCCESS_STATUS = '200';
      const config = corsConfig() as any;
      expect(config.optionsSuccessStatus).toBe(200);
    });
  });

  describe('databaseConfig', () => {
    it('returns database configuration', () => {
      const config = databaseConfig() as any;
      expect(config.type).toBe('postgres');
      expect(config.autoLoadEntities).toBe(true);
      expect(config.synchronize).toBe(false);
    });
  });

  describe('i18nConfig', () => {
    it('returns i18n configuration with defaults', () => {
      const config = i18nConfig() as any;
      expect(config.defaultLocale).toBe('en');
      expect(config.supportedLocales).toEqual(['cn', 'en', 'fr', 'ru', 'vi']);
    });
  });

  describe('mailConfig', () => {
    it('returns mail configuration', () => {
      const config = mailConfig() as any;
      expect(config.transport).toBeDefined();
      expect(config.from).toBe('no-reply@example.com');
    });
  });

  describe('observeConfig', () => {
    it('returns observe configuration', () => {
      const config = observeConfig() as any;
      expect(config).toBeDefined();
    });
  });

  describe('queueConfig', () => {
    it('returns queue configuration with defaults', () => {
      const config = queueConfig() as any;
      expect(config.url).toBe('redis://localhost:6379');
      expect(config.name).toBe('default');
    });
  });

  describe('securityHeaderConfig', () => {
    it('returns security header configuration', () => {
      const config = securityHeaderConfig() as any;
      expect(config.xFrameOptions).toBe(false);
      expect(config.strictTransportSecurity).toBeDefined();
      expect(config.referrerPolicy).toBeDefined();
    });
  });

  describe('swaggerConfig', () => {
    it('returns swagger configuration', () => {
      const config = swaggerConfig() as any;
      expect(config.admin).toBe(true);
    });
  });

  describe('throttleConfig', () => {
    it('returns throttle configuration', () => {
      const config = throttleConfig() as any;
      expect(config.setHeaders).toBe(true);
      expect(Array.isArray(config.throttlers)).toBe(true);
    });
  });
});