import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FloatingActionMenu from '../FloatingActionMenu';

// Mock dependencies
vi.mock('../../../services/announcements', () => ({
  getAnnouncements: vi.fn(() => Promise.resolve([
    { id: '1', title: 'Test Announcement' }
  ]))
}));

vi.mock('../ContactUs', () => ({
  __esModule: true,
  default: () => <button aria-label="Contact us">Mock Contact</button>
}));

vi.mock('../../../features/notifications/components/NotificationCenter', () => ({
  __esModule: true,
  default: () => <div>Mock Notifications</div>
}));

vi.mock('../../../features/accessibility/components/WebAccessibility', () => ({
  __esModule: true,
  default: () => <div>Mock Accessibility</div>
}));

describe('FloatingActionMenu Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true
    });
  });

  it('renders the toggle button', () => {
    render(<FloatingActionMenu />);
    expect(screen.getByRole('button', { name: /Open quick actions/i })).toBeInTheDocument();
  });

  it('opens the menu on toggle click and shows child panels', async () => {
    render(<FloatingActionMenu />);
    const toggleBtn = screen.getByRole('button', { name: /Open quick actions/i });
    
    await userEvent.click(toggleBtn);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Close quick actions/i })).toBeInTheDocument();
      expect(screen.getByText('Mock Notifications')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Contact us' })).toBeInTheDocument();
    });
  });
});
