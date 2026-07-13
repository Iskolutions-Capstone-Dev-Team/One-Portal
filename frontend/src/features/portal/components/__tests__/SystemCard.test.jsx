import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SystemCard from '../SystemCard';

describe('SystemCard Component', () => {
  const mockSystem = {
    title: 'Test System',
    description: 'This is a test description.',
    link: 'https://example.com'
  };

  it('renders system information', () => {
    render(<SystemCard system={mockSystem} />);
    expect(screen.getAllByText('Test System').length).toBeGreaterThan(0);
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('renders disabled state when no link is provided', () => {
    const disabledSystem = { title: 'Disabled System' };
    render(<SystemCard system={disabledSystem} />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
