import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ProtectedPortalRoute } from '../AppRouteGuards';
import { BrowserRouter } from 'react-router-dom';

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
    writable: true,
  });
});

describe('AppRouteGuards Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><ProtectedPortalRoute><div /></ProtectedPortalRoute></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
