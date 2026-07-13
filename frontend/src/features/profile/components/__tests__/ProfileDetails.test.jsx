import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfileDetails from '../ProfileDetails';

describe('ProfileDetails Component', () => {
  it('renders user info', () => {
    render(<ProfileDetails profile={{ firstName: 'John', lastName: 'Doe', id: '123' }} />);
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();
  });
});
