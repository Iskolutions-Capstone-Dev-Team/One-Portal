import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentAuditLogs } from '../logs';
import { apiRequest } from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

describe('logs service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches security logs', async () => {
    apiRequest.mockResolvedValueOnce({
      logs: [{ id: 1, action: 'LOGIN' }],
      totalCount: 1,
      lastPage: 1
    });

    const res = await getRecentAuditLogs(10);
    
    expect(res).toBeDefined();
    expect(apiRequest).toHaveBeenCalled();
  });
});
