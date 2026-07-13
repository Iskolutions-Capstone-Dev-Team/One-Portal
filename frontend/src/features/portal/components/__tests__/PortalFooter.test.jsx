import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortalFooter from '../PortalFooter';

describe('PortalFooter Component', () => {
  it('renders brand and text', () => {
    render(<PortalFooter />);
    expect(screen.getByText('PUPT ONE PORTAL 2026')).toBeInTheDocument();
    expect(screen.getByText('One Portal System')).toBeInTheDocument();
  });

  it('renders legal and social links', () => {
    render(<PortalFooter />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });
});
