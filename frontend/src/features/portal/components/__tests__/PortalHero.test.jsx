import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortalHero from '../PortalHero';

describe('PortalHero Component', () => {
  it('renders hero content', () => {
    render(<PortalHero />);
    expect(screen.getByText('PUP Taguig One Portal')).toBeInTheDocument();
    expect(screen.getByText('Explore Services')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('renders children if provided', () => {
    render(
      <PortalHero>
        <div data-testid="child-element">Child Content</div>
      </PortalHero>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
});
