import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeaturesSection from '../FeaturesSection';

describe('FeaturesSection Component', () => {
  it('renders feature section headers and content', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Access Campus Services Faster')).toBeInTheDocument();
  });
});
