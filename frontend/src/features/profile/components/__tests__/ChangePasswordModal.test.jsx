import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ChangePasswordModal from '../ChangePasswordModal';

describe('ChangePasswordModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
