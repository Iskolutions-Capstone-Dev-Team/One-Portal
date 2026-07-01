import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FaqSection from '../FaqSection';

// Mock the constants
vi.mock('../../constants/landingContent', () => ({
  faqItems: [
    { question: 'Q1?', answer: 'A1' },
    { question: 'Q2?', answer: 'A2' }
  ]
}));

describe('FaqSection', () => {
  it('renders FAQ items', () => {
    render(<FaqSection openFaqIndex={-1} onToggleFaq={() => {}} />);
    
    expect(screen.getByText('Q1?')).toBeInTheDocument();
    expect(screen.getByText('Q2?')).toBeInTheDocument();
  });

  it('calls onToggleFaq when an item is clicked', () => {
    const onToggleFaq = vi.fn();
    render(<FaqSection openFaqIndex={-1} onToggleFaq={onToggleFaq} />);
    
    const firstQuestion = screen.getByText('Q1?');
    fireEvent.click(firstQuestion);
    
    expect(onToggleFaq).toHaveBeenCalledWith(0);
  });

  it('applies open classes when an item is open', () => {
    const { container } = render(<FaqSection openFaqIndex={1} onToggleFaq={() => {}} />);
    
    const items = container.querySelectorAll('.landing-faq__item');
    expect(items[0].className).not.toContain('landing-faq__item--open');
    expect(items[1].className).toContain('landing-faq__item--open');
    
    // Check aria-expanded
    expect(screen.getByText('Q2?').getAttribute('aria-expanded')).toBe('true');
  });
});
