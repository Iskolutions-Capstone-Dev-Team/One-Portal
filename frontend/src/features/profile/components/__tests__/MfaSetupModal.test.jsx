import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import MfaSetupModal from '../MfaSetupModal';

describe('MfaSetupModal Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MfaSetupModal isOpen={true} onClose={vi.fn()} onComplete={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
