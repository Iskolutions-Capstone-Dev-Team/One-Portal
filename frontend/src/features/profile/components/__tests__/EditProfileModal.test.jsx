import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import EditProfileModal from '../EditProfileModal';

describe('EditProfileModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<EditProfileModal isOpen={true} onClose={vi.fn()} user={{}} />);
    expect(container).toBeInTheDocument();
  });
});
