import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AuthenticatorApps from '../AuthenticatorApps';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('AuthenticatorApps Component', () => {
  it('renders without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AuthenticatorApps onSetup={vi.fn()} onDelete={vi.fn()} authenticators={[]} />
      </QueryClientProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
