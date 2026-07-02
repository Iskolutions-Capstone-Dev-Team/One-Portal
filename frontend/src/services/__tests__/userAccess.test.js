import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserAccessSystems } from '../userAccess';
import { apiRequest } from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

describe('userAccess service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user access systems', async () => {
    apiRequest.mockResolvedValueOnce({
      systems: [{ id: 'sys1', name: 'System 1' }]
    });

    const res = await getUserAccessSystems();
    
    // Check if it returns mapped array or direct array
    expect(apiRequest).toHaveBeenCalledWith('/users/access');
  });
});
