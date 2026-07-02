import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Callback from '../Callback';
import * as authService from '../../services/auth';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
  };
});

vi.mock('../../services/auth', () => ({
  completeAuthorization: vi.fn()
}));

describe('Callback Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('calls completeAuthorization and navigates when code is present', async () => {
    mockSearchParams = new URLSearchParams('?code=123');
    
    render(<BrowserRouter><Callback /></BrowserRouter>);
    
    await waitFor(() => {
      expect(authService.completeAuthorization).toHaveBeenCalledWith('123');
      expect(mockNavigate).toHaveBeenCalledWith('/portal', { replace: true });
    });
  });

  it('shows error state when identity provider error is present', async () => {
    mockSearchParams = new URLSearchParams('?error=invalid_request&error_description=bad_req');
    
    render(<BrowserRouter><Callback /></BrowserRouter>);
    
    expect(await screen.findByText('Sign In Failed')).toBeInTheDocument();
    expect(screen.getByText('bad_req')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to home page/i })).toBeInTheDocument();
  });

  it('shows error state when code is missing', async () => {
    render(<BrowserRouter><Callback /></BrowserRouter>);
    
    expect(await screen.findByText('Sign In Failed')).toBeInTheDocument();
    expect(screen.getByText('The callback is missing the authorization code.')).toBeInTheDocument();
  });
});
