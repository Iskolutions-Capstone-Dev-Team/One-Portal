import { describe, it, expect } from 'vitest';
import { landingRoutes } from '../routeConfig';

describe('routeConfig', () => {
  it('exports a valid route configuration', () => {
    expect(landingRoutes).toBeDefined();
  });
});
