import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SuccessAlert from '../SuccessAlert';

describe('SuccessAlert Component', () => {
  it('renders the message when provided', async () => {
    render(<SuccessAlert message="Data saved successfully" />);
    const messageElement = await screen.findByText('Data saved successfully');
    expect(messageElement).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<SuccessAlert message="Success" onClose={handleClose} />);
    const closeButton = await screen.findByRole('button', { name: /Dismiss alert/i });
    expect(closeButton).toBeInTheDocument();
    
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
