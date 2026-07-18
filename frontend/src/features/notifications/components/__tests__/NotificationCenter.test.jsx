import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationCenter from '../NotificationCenter';

describe('NotificationCenter Component', () => {
  it('renders notification bell', () => {
    render(<NotificationCenter />);
    // Just simple render test for now, checking if button renders
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
