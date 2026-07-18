import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logout from '../Logout';
import * as authService from '../../services/auth';

vi.mock('../../components/AuthLoadingScreen', () => ({
  default: ({ message }) => <div data-testid="loading-screen">{message}</div>
}));

vi.mock('../../services/auth', () => ({
  logoutSession: vi.fn(() => Promise.resolve('/redirect-url')),
  clearSessionRefreshTimestamp: vi.fn(),
  getLogoutFallbackUrl: vi.fn(() => '/fallback-url'),
}));

describe('Logout Page', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { assign: vi.fn() },
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('renders loading screen and redirects on success', async () => {
    render(<Logout />);
    
    expect(screen.getByTestId('loading-screen')).toHaveTextContent('Signing You Out');
    
    await waitFor(() => {
        expect(authService.logoutSession).toHaveBeenCalled();
        expect(authService.clearSessionRefreshTimestamp).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/redirect-url');
    });
  });

  it('redirects to fallback on failure', async () => {
    authService.logoutSession.mockRejectedValueOnce(new Error('Failed'));
    
    render(<Logout />);
    
    await waitFor(() => {
        expect(authService.logoutSession).toHaveBeenCalled();
        expect(authService.clearSessionRefreshTimestamp).toHaveBeenCalled();
        expect(window.location.assign).toHaveBeenCalledWith('/fallback-url');
    });
  });
});
