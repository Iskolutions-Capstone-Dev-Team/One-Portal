import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortalThemeProvider, usePortalTheme } from '../PortalThemeProvider';
import React from 'react';

const TestComponent = () => {
  const { theme, isDarkMode, toggleTheme } = usePortalTheme();
  
  return (
    <div>
      <div data-testid="theme-val">{theme}</div>
      <div data-testid="is-dark">{isDarkMode ? 'yes' : 'no'}</div>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('PortalThemeProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true
    });
  });

  it('initializes with theme from localStorage', () => {
    window.localStorage.getItem.mockReturnValue('dark');
    
    render(
      <PortalThemeProvider>
        <TestComponent />
      </PortalThemeProvider>
    );
    
    expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('yes');
  });

  it('toggles theme and updates localStorage', async () => {
    window.localStorage.getItem.mockReturnValue('light');
    
    render(
      <PortalThemeProvider>
        <TestComponent />
      </PortalThemeProvider>
    );
    
    const btn = screen.getByRole('button', { name: 'Toggle' });
    await userEvent.click(btn);
    
    expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('portal-theme', 'dark');
  });

  it('throws an error if used outside of provider', () => {
    const originalError = console.error;
    console.error = vi.fn();
    
    expect(() => render(<TestComponent />)).toThrow('usePortalTheme must be used within a PortalThemeProvider');
    
    console.error = originalError;
  });
});
