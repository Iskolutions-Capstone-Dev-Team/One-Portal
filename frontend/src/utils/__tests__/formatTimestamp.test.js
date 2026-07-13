import { describe, it, expect } from 'vitest';
import { formatTimestamp } from '../formatTimestamp';

describe('formatTimestamp', () => {
  it('formats an ISO string correctly', () => {
    const isoString = '2025-01-15T14:30:45Z';
    const formatted = formatTimestamp(isoString);
    
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
