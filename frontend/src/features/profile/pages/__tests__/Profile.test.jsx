import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Profile from '../Profile';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../../providers/PortalThemeProvider', () => ({
  usePortalTheme: () => ({ theme: {}, isDarkMode: false })
}));

vi.mock('../../../../components/ui/GradientWaves', () => ({
  default: () => <div data-testid="gradient-waves" />
}));

describe('Profile Page', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
      writable: true,
    });
  });

  it('renders without crashing and displays profile tabs', () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Authenticators/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Remembered Devices/i })).toBeInTheDocument();
  });
});
