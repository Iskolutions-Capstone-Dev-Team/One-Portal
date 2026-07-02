import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmailStatus from '../EmailStatus';

describe('EmailStatus Component', () => {
  it('renders email status properly', () => {
    render(<EmailStatus email="test@example.com" />);
    expect(screen.getByText('Email Active')).toBeInTheDocument();
  });
});
