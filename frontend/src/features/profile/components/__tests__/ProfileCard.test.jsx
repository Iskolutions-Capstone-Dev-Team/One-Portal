import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ProfileCard from '../ProfileCard';

describe('ProfileCard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileCard onEditClick={vi.fn()} profile={{ firstName: '', middleName: '', lastName: '' }} />);
    expect(container).toBeInTheDocument();
  });
});
