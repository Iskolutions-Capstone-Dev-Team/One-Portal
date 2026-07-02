import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuthLoadingScreen from '../AuthLoadingScreen';

describe('AuthLoadingScreen Component', () => {
  it('renders the main message and PUP logo', () => {
    render(<AuthLoadingScreen message="Authenticating" />);
    
    expect(screen.getByText('Authenticating')).toBeInTheDocument();
    expect(screen.getByAltText('PUP Logo')).toBeInTheDocument();
  });

  it('shows loading indicators when no errorMessage is provided', () => {
    const { container } = render(<AuthLoadingScreen message="Loading..." />);
    
    // Check for loading ring and dots
    const loadingRing = container.querySelector('.loading-ring');
    const loadingDots = screen.getByLabelText('Loading');
    
    expect(loadingRing).toBeInTheDocument();
    expect(loadingDots).toBeInTheDocument();
  });

  it('renders the errorMessage and hides loading indicators', () => {
    const { container } = render(
      <AuthLoadingScreen message="Failed" errorMessage="Invalid credentials" />
    );
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    
    // Loading elements should NOT be present
    const loadingRing = container.querySelector('.loading-ring');
    const loadingDots = screen.queryByLabelText('Loading');
    
    expect(loadingRing).toBeNull();
    expect(loadingDots).not.toBeInTheDocument();
  });

  it('renders action elements when provided', () => {
    render(
      <AuthLoadingScreen 
        message="Error" 
        errorMessage="Something went wrong" 
        action={<button>Retry</button>} 
      />
    );
    
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('applies fixed positioning if isFixed is true', () => {
    const { container } = render(<AuthLoadingScreen message="Wait" isFixed={true} />);
    // The outermost div should have 'fixed' class
    expect(container.firstChild.className).toContain('fixed');
  });
});
