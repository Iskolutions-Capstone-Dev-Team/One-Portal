import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MotionWrapper from '../MotionWrapper';

// Mock IntersectionObserver which is required by framer-motion's whileInView
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserverMock;

describe('MotionWrapper Component', () => {
  it('renders its children correctly', () => {
    render(
      <MotionWrapper>
        <div data-testid="child-element">Hello Motion</div>
      </MotionWrapper>
    );
    
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Hello Motion')).toBeInTheDocument();
  });
});
