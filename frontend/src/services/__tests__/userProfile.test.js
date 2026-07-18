import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUserProfile, updateCurrentUserProfile, clearCurrentUserProfileCache, createEmptyProfile } from '../userProfile';
import { apiRequest } from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

describe('userProfile service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCurrentUserProfileCache();
  });

  describe('getCurrentUserProfile', () => {
    it('fetches profile successfully', async () => {
      apiRequest.mockResolvedValueOnce({
        id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      });

      const profile = await getCurrentUserProfile();
      
      expect(profile).toEqual({
        id: 'user-1',
        firstName: 'John',
        middleName: '',
        lastName: 'Doe',
        nameSuffix: '',
        email: 'john@example.com'
      });
      expect(apiRequest).toHaveBeenCalledWith('/userinfo');
    });

    it('returns cached profile on subsequent calls', async () => {
      apiRequest.mockResolvedValueOnce({ id: 'user-1' });

      await getCurrentUserProfile();
      const profile2 = await getCurrentUserProfile();
      
      expect(profile2.id).toBe('user-1');
      expect(apiRequest).toHaveBeenCalledTimes(1); // Cached
    });
  });

  describe('updateCurrentUserProfile', () => {
    it('throws error if no user ID is provided', async () => {
      await expect(updateCurrentUserProfile({})).rejects.toThrow('User ID is required to update the profile.');
    });

    it('updates profile and caches it', async () => {
      apiRequest.mockResolvedValueOnce({}); // patch success

      const updated = await updateCurrentUserProfile({
        id: 'user-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com'
      });

      expect(updated.firstName).toBe('Jane');
      expect(apiRequest).toHaveBeenCalledWith('/user/user-1/name', expect.objectContaining({
        method: 'PATCH',
        data: {
          first_name: 'Jane',
          middle_name: '',
          last_name: 'Doe',
          name_suffix: ''
        }
      }));
    });
  });
});
