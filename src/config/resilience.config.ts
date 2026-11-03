import { registerAs } from '@nestjs/config';
import { ResilienceModuleOptions } from '@nestjs/resilience';

/**
 * Resilience configuration namespace using @nestjs/resilience.
 *
 * Defines application-wide default reliability policies applied to HTTP routes,
 * GraphQL resolvers, microservice and WebSocket handlers, or invoked manually
 * via `ResilienceService`. The defaults configured here are:
 * - Timeout: 5 seconds.
 * - Retry: 3 attempts with exponential backoff starting at 200ms (max 2s).
 * - Circuit breaker: opens at a 50% failure rate after at least 5 calls,
 *   staying open for 30 seconds.
 *
 * Policies can be overridden per handler using decorators such as `@Retry()`,
 * `@Timeout()`, `@CircuitBreaker()`, `@Bulkhead()`, `@Fallback()` and
 * `@OutboundRateLimit()`, or via named presets registered here.
 *
 * @see https://docs.nestjs.com/reliability/resilience
 */
export const resilienceConfig = registerAs<ResilienceModuleOptions>(
  'resilience',
  () => ({
    defaults: {
      timeout: '5s',
      retry: { attempts: 3, backoff: { delay: '200ms', maxDelay: '2s' } },
      circuitBreaker: {
        failureRateThreshold: 50,
        minimumCalls: 5,
        openDuration: '30s',
      },
    },
  })
);