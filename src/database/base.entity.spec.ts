import { describe, expect, it } from 'vitest';

import { BaseEntity } from './base.entity.js';

describe('BaseEntity', () => {
  it('can be extended and instantiated', () => {
    class TestEntity extends BaseEntity {}
    const entity = new TestEntity();

    expect(entity).toBeInstanceOf(BaseEntity);
    expect(entity).toBeInstanceOf(TestEntity);
  });

  it('exposes the expected audit columns', () => {
    class TestEntity extends BaseEntity {}
    const entity = new TestEntity() as any;

    // Columns are declared on the prototype via decorators; assignment works.
    entity.id = '123e4567-e89b-12d3-a456-426614174000';
    entity.createdAt = new Date('2026-01-01T00:00:00.000Z');
    entity.updatedAt = new Date('2026-01-02T00:00:00.000Z');
    entity.deletedAt = null;

    expect(entity.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.deletedAt).toBeNull();
  });
});