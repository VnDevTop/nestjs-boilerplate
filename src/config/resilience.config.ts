import { registerAs } from '@nestjs/config';
import { ResilienceModuleOptions } from '@nestjs/resilience';

/**
 * Resilience configuration namespace using @nestjs/resilience.
 *
 * Defines application-wide default reliability policies applied to HTTP routes,
 * GraphQL resolvers, microservice and WebSocket handlers, or invoked manually
 * via `ResilienceService`. Retry and timeout defaults are configurable via
 * environment variables:
 * - RESILIENCE_TIMEOUT: Default timeout duration (default: '5s').
 * - RESILIENCE_RETRY_ATTEMPTS: Number of retry attempts (default: 3).
 * - RESILIENCE_RETRY_DELAY: Initial retry backoff delay (default: '200ms').
 * - RESILIENCE_RETRY_MAX_DELAY: Maximum retry backoff delay (default: '2s').
 * - Circuit breaker: opens at a configurable failure rate (default 50%) after
 *   at least 5 calls, staying open for 30 seconds.
 * - Bulkhead: limits concurrent calls (default 10) with no queued calls by
 *   default.
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
      timeout: (process.env.RESILIENCE_TIMEOUT ?? '5s') as any,
      retry: {
        attempts: Number(process.env.RESILIENCE_RETRY_ATTEMPTS ?? 3),
        backoff: {
          delay: (process.env.RESILIENCE_RETRY_DELAY ?? '200ms') as any,
          maxDelay: (process.env.RESILIENCE_RETRY_MAX_DELAY ?? '2s') as any,
        },
      },
      circuitBreaker: {
        failureRateThreshold: Number(process.env.RESILIENCE_CIRCUIT_FAILURE_THRESHOLD ?? 50),
        minimumCalls: Number(process.env.RESILIENCE_CIRCUIT_MINIMUM_CALLS ?? 5),
        openDuration: (process.env.RESILIENCE_CIRCUIT_OPEN_DURATION ?? '30s') as any,
      },
      bulkhead: {
        maxConcurrent: Number(process.env.RESILIENCE_BULKHEAD_MAX_CONCURRENT ?? 10),
        maxQueue: Number(process.env.RESILIENCE_BULKHEAD_MAX_QUEUE ?? 0),
      },
    },
    presets: {
      default: {
        retry: Number(process.env.RESILIENCE_RETRY_ATTEMPTS ?? 3),
        timeout: (process.env.RESILIENCE_TIMEOUT ?? '5s') as any,
        circuitBreaker: {
          failureRateThreshold: Number(process.env.RESILIENCE_CIRCUIT_FAILURE_THRESHOLD ?? 50),
          minimumCalls: Number(process.env.RESILIENCE_CIRCUIT_MINIMUM_CALLS ?? 5),
          openDuration: (process.env.RESILIENCE_CIRCUIT_OPEN_DURATION ?? '30s') as any,
        },
        bulkhead: {
          maxConcurrent: Number(process.env.RESILIENCE_BULKHEAD_MAX_CONCURRENT ?? 10),
          maxQueue: Number(process.env.RESILIENCE_BULKHEAD_MAX_QUEUE ?? 0),
        },
        fallback: (error: unknown) => {
          // Default fallback: rethrow so callers receive the original failure.
          throw error;
        },
      },
    },
  })
);