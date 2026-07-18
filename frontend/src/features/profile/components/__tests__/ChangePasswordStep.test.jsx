import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ChangePasswordStep from '../ChangePasswordStep';

describe('ChangePasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChangePasswordStep form={{ currentPassword: '', newPassword: '', confirmPassword: '' }} onFormChange={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
