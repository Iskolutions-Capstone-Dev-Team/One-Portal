import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../HeroSection';

describe('HeroSection Component', () => {
  it('renders hero content', () => {
    render(<HeroSection pendingAction="" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getAllByText(/Services\./i).length).toBeGreaterThan(0);
  });
});
