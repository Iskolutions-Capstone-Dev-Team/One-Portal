import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AuthenticatorApps from '../AuthenticatorApps';

describe('AuthenticatorApps Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuthenticatorApps onSetup={vi.fn()} onDelete={vi.fn()} authenticators={[]} />);
    expect(container).toBeInTheDocument();
  });
});
