import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendProfileOtp, verifyProfileOtp, changeCurrentUserPassword } from '../userSecurity';
import { apiRequest } from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

describe('userSecurity service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends profile otp', async () => {
    apiRequest.mockResolvedValueOnce({ success: true });
    await sendProfileOtp('test@example.com');
    expect(apiRequest).toHaveBeenCalled();
  });

  it('verifies profile otp', async () => {
    apiRequest.mockResolvedValueOnce({ success: true });
    await verifyProfileOtp('test@example.com', '123456');
    expect(apiRequest).toHaveBeenCalled();
  });

  it('changes password', async () => {
    apiRequest.mockResolvedValueOnce({ success: true });
    await changeCurrentUserPassword({ currentPassword: 'old', newPassword: 'new' });
    expect(apiRequest).toHaveBeenCalled();
  });
});
