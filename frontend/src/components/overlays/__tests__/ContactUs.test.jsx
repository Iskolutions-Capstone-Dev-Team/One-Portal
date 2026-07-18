import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ContactUs from '../ContactUs';

describe('ContactUs Component', () => {
  it('renders the email link correctly', () => {
    render(<ContactUs />);
    
    const link = screen.getByRole('link', { name: 'Contact us by email' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'mailto:iskolutions.team@gmail.com');
  });

  it('renders the tooltip text', () => {
    render(<ContactUs />);
    
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<ContactUs onClick={handleClick} />);
    
    const link = screen.getByRole('link', { name: 'Contact us by email' });
    await userEvent.click(link);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
