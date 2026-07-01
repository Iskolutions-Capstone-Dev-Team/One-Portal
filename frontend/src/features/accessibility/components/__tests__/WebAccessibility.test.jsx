import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WebAccessibility from '../WebAccessibility';
import { usePortalTheme } from '../../../../providers/PortalThemeProvider';

// Mock the theme provider
vi.mock('../../../../providers/PortalThemeProvider', () => ({
  usePortalTheme: vi.fn()
}));

describe('WebAccessibility', () => {
  beforeEach(() => {
    usePortalTheme.mockReturnValue({ theme: 'light' });
    // Clean up DOM between tests
    document.body.innerHTML = '';
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isButtonVisible is false', () => {
    const { container } = render(<WebAccessibility isButtonVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders button when isButtonVisible is true', () => {
    render(<WebAccessibility isButtonVisible={true} />);
    expect(screen.getByRole('button', { name: /open accessibility menu/i })).toBeInTheDocument();
  });

  it('applies theme to document element', () => {
    usePortalTheme.mockReturnValue({ theme: 'dark' });
    render(<WebAccessibility isButtonVisible={true} />);
    expect(document.documentElement.getAttribute('data-portal-theme')).toBe('dark');
  });

  it('calls onActivate and manages sienna script when clicked', async () => {
    const onActivate = vi.fn();
    render(<WebAccessibility isButtonVisible={true} onActivate={onActivate} />);
    
    const button = screen.getByRole('button', { name: /open accessibility menu/i });
    fireEvent.click(button);
    
    expect(onActivate).toHaveBeenCalled();
    
    // Verify script injection
    const script = document.getElementById('portal-accessibility-script');
    expect(script).toBeInTheDocument();
    expect(script.src).toContain('sienna-accessibility.umd.js');
  });
});
