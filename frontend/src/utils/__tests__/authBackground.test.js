import { describe, it, expect } from 'vitest';
import { authPageBackground, authPagePattern, authPagePatternStyle } from '../authBackground';

describe('authBackground', () => {
  it('exports background constants correctly', () => {
    expect(typeof authPageBackground).toBe('string');
    expect(authPageBackground).toContain('radial-gradient');
    
    expect(typeof authPagePattern).toBe('string');
    expect(authPagePattern).toContain('radial-gradient');
  });

  it('exports pattern style object correctly', () => {
    expect(authPagePatternStyle).toHaveProperty('backgroundImage', authPagePattern);
    expect(authPagePatternStyle).toHaveProperty('backgroundPosition');
    expect(authPagePatternStyle).toHaveProperty('backgroundSize');
  });
});
