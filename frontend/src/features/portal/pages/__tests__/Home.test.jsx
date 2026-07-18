import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../Home';
import { getUserAccessSystems } from '../../../../services/userAccess';

vi.mock('../../../../services/userAccess', () => ({
  getUserAccessSystems: vi.fn()
}));

vi.mock('../../../../services/auth', () => ({
  clearSessionState: vi.fn(),
  navigateToLandingPage: vi.fn()
}));

vi.mock('../../../../layouts/OnePortalLayout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  it('renders loading state initially', () => {
    getUserAccessSystems.mockReturnValue(new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText('Loading your available systems...')).toBeInTheDocument();
  });

  it('renders systems when loaded', async () => {
    getUserAccessSystems.mockResolvedValueOnce([
      { id: 1, title: 'Test System', link: 'http://test' }
    ]);
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Test System').length).toBeGreaterThan(0);
    });
  });
});
