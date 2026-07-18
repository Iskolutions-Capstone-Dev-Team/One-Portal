import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccessibilityIcon } from '../accessibilityIcons';

describe('accessibilityIcons', () => {
  it('renders the SVG icon', () => {
    const { container } = render(<AccessibilityIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
