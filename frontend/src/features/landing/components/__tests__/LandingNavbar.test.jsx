import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingNavbar from '../LandingNavbar';

describe('LandingNavbar Component', () => {
  it('renders brand and navigation links', () => {
    render(<LandingNavbar pendingAction="" onLoginClick={() => {}} />);
    expect(screen.getByText('One Portal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('calls onLoginClick when login button is clicked', () => {
    const handleLogin = vi.fn();
    render(<LandingNavbar pendingAction="" onLoginClick={handleLogin} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('shows pending state when pendingAction is login', () => {
    render(<LandingNavbar pendingAction="login" onLoginClick={() => {}} />);
    const btn = screen.getByRole('button', { name: /Opening.../i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});
