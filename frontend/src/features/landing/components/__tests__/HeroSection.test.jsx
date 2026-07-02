import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../HeroSection';

describe('HeroSection Component', () => {
  it('renders hero content', () => {
    render(<HeroSection pendingAction="" onRegisterClick={() => {}} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getAllByText(/Services\./i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('calls onRegisterClick when register button is clicked', () => {
    const handleRegister = vi.fn();
    render(<HeroSection pendingAction="" onRegisterClick={handleRegister} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    expect(handleRegister).toHaveBeenCalledTimes(1);
  });

  it('shows opening state when pendingAction is register', () => {
    render(<HeroSection pendingAction="register" onRegisterClick={() => {}} />);
    const btn = screen.getByRole('button', { name: /Opening.../i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});
