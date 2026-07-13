import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OnePortalLayout from '../OnePortalLayout';

vi.mock('../../components/navigation/PortalNavbar', () => ({
  default: () => <div data-testid="navbar" />
}));

vi.mock('../../features/portal/components/PortalFooter', () => ({
  default: () => <div data-testid="footer" />
}));

vi.mock('../../components/overlays/FloatingActionMenu', () => ({
  default: () => <div data-testid="fam" />
}));

vi.mock('../../providers/PortalThemeProvider', () => ({
  usePortalTheme: () => ({ theme: 'light' })
}));

vi.mock('../../services/auth', () => ({
  clearSessionRefreshTimestamp: vi.fn(),
  getSessionRefreshDelay: () => 1000,
  refreshSession: vi.fn()
}));

describe('OnePortalLayout', () => {
  it('renders core layout components and children', () => {
    render(
      <OnePortalLayout>
        <div data-testid="child-content">Child Content</div>
      </OnePortalLayout>
    );
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('fam')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
