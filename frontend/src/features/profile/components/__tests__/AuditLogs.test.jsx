import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AuditLogs from '../AuditLogs';

describe('AuditLogs Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuditLogs logs={[]} />);
    expect(container).toBeInTheDocument();
  });
});
