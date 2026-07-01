import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SystemGrid from '../SystemGrid';

vi.mock('../SystemCard', () => ({
  default: ({ system }) => <div data-testid={`system-card-${system.id}`}>{system.name}</div>
}));

vi.mock('../../../components/ui/MotionWrapper', () => ({
  default: ({ children }) => <div data-testid="motion-wrapper">{children}</div>
}));

class IntersectionObserverMock {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

describe('SystemGrid', () => {
  it('renders empty message when no systems', () => {
    render(<SystemGrid systems={[]} emptyMessage="No systems here" />);
    expect(screen.getByText('No systems here')).toBeInTheDocument();
  });

  it('renders paginated systems', () => {
    const systems = [
      { id: '1', name: 'System 1' },
      { id: '2', name: 'System 2' },
      { id: '3', name: 'System 3' },
    ];
    
    // page 1, 2 items per page
    render(<SystemGrid systems={systems} currentPage={1} cardsPerPage={2} />);
    
    expect(screen.getByTestId('system-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('system-card-2')).toBeInTheDocument();
    expect(screen.queryByTestId('system-card-3')).not.toBeInTheDocument();
  });
});
