import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import PortalNavbar from '../PortalNavbar';

// Mock Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: '/portal' })),
  };
});

// Mock Portal Theme
const mockToggleTheme = vi.fn();
vi.mock('../../../providers/PortalThemeProvider', () => ({
  usePortalTheme: () => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme
  })
}));

describe('PortalNavbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLocation.mockReturnValue({ pathname: '/portal' });
  });

  it('renders branding and theme toggle', () => {
    render(
      <MemoryRouter>
        <PortalNavbar />
      </MemoryRouter>
    );
    
    expect(screen.getByText('PUP TAGUIG ONE PORTAL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Switch to dark mode/i })).toBeInTheDocument();
  });

  it('calls toggleTheme when theme button is clicked', async () => {
    render(
      <MemoryRouter>
        <PortalNavbar />
      </MemoryRouter>
    );
    
    const btn = screen.getByRole('button', { name: /Switch to dark mode/i });
    await userEvent.click(btn);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('opens dropdown and shows Profile if not on /profile', async () => {
    render(
      <MemoryRouter>
        <PortalNavbar />
      </MemoryRouter>
    );
    
    const profileBtn = screen.getByRole('button', { name: /Open portal menu/i });
    await userEvent.click(profileBtn);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('opens dropdown and shows Dashboard if on /profile', async () => {
    useLocation.mockReturnValue({ pathname: '/profile' });
    
    render(
      <MemoryRouter>
        <PortalNavbar />
      </MemoryRouter>
    );
    
    const profileBtn = screen.getByRole('button', { name: /Open portal menu/i });
    await userEvent.click(profileBtn);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  
  it('navigates to logout', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    render(
      <MemoryRouter>
        <PortalNavbar />
      </MemoryRouter>
    );
    
    const profileBtn = screen.getByRole('button', { name: /Open portal menu/i });
    await userEvent.click(profileBtn);
    
    const logoutMenuBtn = screen.getByText('Logout').closest('button');
    await userEvent.click(logoutMenuBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/logout');
  });
});
