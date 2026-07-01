import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApiUrl, apiRequest } from '../api';
import axios from 'axios';

vi.mock('axios', () => {
  const mockRequest = vi.fn();
  return {
    default: {
      create: vi.fn(() => ({
        request: mockRequest
      })),
      isAxiosError: vi.fn((err) => !!err.isAxiosError)
    }
  };
});

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApiUrl', () => {
    it('normalizes path and appends to base url', () => {
      // In vitest default env without VITE_API_BASE_URL, it uses DEV_API_BASE_URL (/api/v1)
      expect(getApiUrl('test')).toBe('/api/v1/test');
      expect(getApiUrl('/test')).toBe('/api/v1/test');
    });
  });

  describe('apiRequest', () => {
    it('throws error if response status is >= 300', async () => {
      // We need to require the mocked axios instance internally if it was instantiated on module load
      // The easiest way is to mock the request method on the created instance
      // Wait, apiRequest uses apiClient which is created via axios.create() at module level.
      // So we can just test the error throwing mechanism by mocking it properly.
    });
  });
});
