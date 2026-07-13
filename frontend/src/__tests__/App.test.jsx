import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
    writable: true,
  });
});

describe('App', () => {
  it('is a placeholder for App', () => {
    expect(true).toBe(true);
  });
});
