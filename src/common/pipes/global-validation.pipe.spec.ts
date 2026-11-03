import { ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { createGlobalValidationPipe } from './global-validation.pipe.js';

describe('createGlobalValidationPipe', () => {
  it('returns a ValidationPipe instance', () => {
    const pipe = createGlobalValidationPipe();

    expect(pipe).toBeInstanceOf(ValidationPipe);
  });
});