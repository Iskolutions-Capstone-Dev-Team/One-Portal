import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAnnouncements } from '../announcements';
import { apiRequest } from '../api';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

describe('announcements service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches announcements successfully', async () => {
    apiRequest.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: 'Test Announcement',
          content: 'This is a test.',
          link: 'http://example.com'
        }
      ]
    });

    const announcements = await getAnnouncements();
    
    expect(announcements).toHaveLength(1);
    expect(announcements[0].title).toBe('Test Announcement');
    expect(apiRequest).toHaveBeenCalledWith('/announcement');
  });
});
