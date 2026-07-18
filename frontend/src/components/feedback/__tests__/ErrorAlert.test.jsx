import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert Component', () => {
  it('renders the message when provided', async () => {
    render(<ErrorAlert message="Connection failed" />);
    const messageElement = await screen.findByText('Connection failed');
    expect(messageElement).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<ErrorAlert message="Error occurred" onClose={handleClose} />);
    
    // In One-Portal, the close button text is just 'x' or 'Dismiss error alert'
    const closeButton = await screen.findByRole('button', { name: /Dismiss error alert/i });
    expect(closeButton).toBeInTheDocument();
    
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
