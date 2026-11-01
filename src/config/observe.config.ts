import { registerAs } from '@nestjs/config';
import type { ObserveOptions } from '@nestjs/observe';

/**
 * NestJS Observe configuration namespace.
 */
export const observeConfig = registerAs<ObserveOptions>(
  'observe',
  (): ObserveOptions =>
    // ObserveOptions declares all three as required strings, while the env types
    // allow them to be absent. That is consistent with how the module is wired:
    // it is only registered when all three are set, so a missing value here is
    // never read.
    ({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      serviceId: 'nestjs-boilerplate',
    })
);