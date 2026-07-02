import { describe, it, expect } from 'vitest';
import { landingRoutes } from '../landingRoutes';

describe('landingRoutes', () => {
  it('exports an array of routes', () => {
    expect(Array.isArray(landingRoutes)).toBe(true);
  });
});
