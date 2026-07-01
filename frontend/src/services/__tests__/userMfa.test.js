import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMfaSetup, getAuthenticators, saveAuthenticator, deleteAuthenticator } from '../userMfa';
import { apiRequest } from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

describe('userMfa service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches mfa setup', async () => {
    apiRequest.mockResolvedValueOnce({ secret: 'abc' });
    const res = await getMfaSetup('test@example.com');
    expect(apiRequest).toHaveBeenCalled();
  });

  it('saves authenticator', async () => {
    apiRequest.mockResolvedValueOnce({ success: true });
    await saveAuthenticator({ email: 'test@example.com', secret: 'abc', code: '123456', name: 'Device' });
    expect(apiRequest).toHaveBeenCalled();
  });

  it('deletes authenticator', async () => {
    apiRequest.mockResolvedValueOnce({ success: true });
    await deleteAuthenticator({ email: 'test@example.com', id: '123' });
    expect(apiRequest).toHaveBeenCalled();
  });
});
