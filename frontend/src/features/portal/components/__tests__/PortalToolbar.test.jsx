import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PortalToolbar from '../PortalToolbar';

describe('PortalToolbar Component', () => {
  it('renders toolbar text', () => {
    render(<PortalToolbar searchQuery="" setSearchQuery={() => {}} />);
    expect(screen.getByText('Welcome back,')).toBeInTheDocument();
    expect(screen.getByText('PUPTian!')).toBeInTheDocument();
  });

  it('handles search input', () => {
    const setSearchQuery = vi.fn();
    render(<PortalToolbar searchQuery="" setSearchQuery={setSearchQuery} />);
    
    const input = screen.getByPlaceholderText('Search systems');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(setSearchQuery).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<PortalToolbar searchQuery="" setSearchQuery={() => {}} isSearchDisabled={true} />);
    const input = screen.getByPlaceholderText('Search systems');
    expect(input).toBeDisabled();
  });
});
