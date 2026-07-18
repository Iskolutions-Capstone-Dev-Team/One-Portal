import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
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
  completeAuthorization: vi.fn(),
  startAuthorization: vi.fn()
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders without error and calls startAuthorization when no params', async () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    
    expect(screen.getByAltText('PUP Logo')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(authService.startAuthorization).toHaveBeenCalled();
    });
  });

  it('calls completeAuthorization and navigates when code is present', async () => {
    mockSearchParams = new URLSearchParams('?code=12345');
    
    render(<BrowserRouter><Login /></BrowserRouter>);
    
    await waitFor(() => {
      expect(authService.completeAuthorization).toHaveBeenCalledWith('12345');
      expect(mockNavigate).toHaveBeenCalledWith('/portal', { replace: true });
    });
  });

  it('shows error link when identity provider error is present', async () => {
    mockSearchParams = new URLSearchParams('?error=access_denied');
    
    render(<BrowserRouter><Login /></BrowserRouter>);
    
    expect(await screen.findByRole('link', { name: /Return to home page/i })).toBeInTheDocument();
  });
});
