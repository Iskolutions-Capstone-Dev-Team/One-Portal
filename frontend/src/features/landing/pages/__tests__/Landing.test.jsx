import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Landing from '../Landing';

// Mock IntersectionObserver
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  window.IntersectionObserver = class {
    observe = observeMock;
    unobserve = unobserveMock;
    disconnect = disconnectMock;
  };
});

// Mock services to prevent actual navigation logic
vi.mock('../../../services/auth', () => ({
  startAuthorization: vi.fn(),
  navigateToRegisterPage: vi.fn(),
}));

describe('Landing Page', () => {
  it('renders landing sections', () => {
    render(<Landing />);
    
    // Check if Navbar rendered
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Check if Hero rendered
    expect(screen.getAllByText(/Access/i).length).toBeGreaterThan(0);
    // Check if Features rendered
    expect(screen.getAllByText(/Features/i).length).toBeGreaterThan(0);
  });
});
