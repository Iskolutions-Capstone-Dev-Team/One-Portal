import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  it('does not render if totalPages is 1 or less', () => {
    const { container } = render(<Pagination totalPages={1} currentPage={1} onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the correct number of page buttons', () => {
    render(<Pagination totalPages={5} currentPage={1} onPageChange={() => {}} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    expect(buttons[0]).toHaveTextContent('1');
    expect(buttons[4]).toHaveTextContent('5');
  });

  it('applies the active class to the current page', () => {
    render(<Pagination totalPages={3} currentPage={2} onPageChange={() => {}} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toHaveClass('is-active');
    expect(buttons[1]).toHaveClass('is-active'); // Page 2
    expect(buttons[1]).toHaveAttribute('aria-current', 'page');
    expect(buttons[2]).not.toHaveClass('is-active');
  });

  it('calls onPageChange with the correct page number when clicked', async () => {
    const handlePageChange = vi.fn();
    render(<Pagination totalPages={4} currentPage={1} onPageChange={handlePageChange} />);
    
    const page3Button = screen.getByRole('button', { name: '3' });
    await userEvent.click(page3Button);
    
    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
