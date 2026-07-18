import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Profile from '../Profile';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../../providers/PortalThemeProvider', () => ({
  usePortalTheme: () => ({ theme: {} })
}));

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
    writable: true,
  });
});

describe('Profile Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><Profile /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
