import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import OtpVerificationStep from '../OtpVerificationStep';

describe('OtpVerificationStep Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<OtpVerificationStep otp={[]} onOtpChange={vi.fn()} onVerify={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
