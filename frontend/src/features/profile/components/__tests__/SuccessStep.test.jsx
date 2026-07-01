import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SuccessStep from '../SuccessStep';

describe('SuccessStep Component', () => {
  it('renders success message', () => {
    render(<SuccessStep title="Success!" message="Done" onFinish={() => {}} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
