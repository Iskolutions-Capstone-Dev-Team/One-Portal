import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaDeleteConfirmModal from '../MfaDeleteConfirmModal';

describe('MfaDeleteConfirmModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaDeleteConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
