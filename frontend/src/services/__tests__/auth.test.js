import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLoginPageUrl, getRegisterPageUrl, getLandingPageUrl, navigateToLandingPage, clearSessionCookies } from '../auth';

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLandingPageUrl', () => {
    it('returns landing page absolute URL', () => {
      expect(getLandingPageUrl()).toContain('/landing');
    });
  });

  describe('getLoginPageUrl', () => {
    it('returns login page absolute URL with redirect_uri', () => {
      const url = getLoginPageUrl();
      expect(url).toContain('/login');
      expect(url).toContain('redirect_uri=');
    });
  });

  describe('getRegisterPageUrl', () => {
    it('returns register page absolute URL with redirect_uri', () => {
      const url = getRegisterPageUrl();
      expect(url).toContain('/register');
      expect(url).toContain('redirect_uri=');
    });
  });

  describe('navigateToLandingPage', () => {
    it('assigns window location if not already on landing page', () => {
      const originalLocation = window.location;
      
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          href: 'http://localhost/different',
          assign: vi.fn(),
          origin: 'http://localhost'
        },
        writable: true
      });
      
      const didNavigate = navigateToLandingPage();
      
      expect(didNavigate).toBe(true);
      expect(window.location.assign).toHaveBeenCalled();
      
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      });
    });
  });
  
  describe('clearSessionCookies', () => {
    it('clears cookies', () => {
      document.cookie = 'access_token=123';
      clearSessionCookies();
      expect(document.cookie).not.toContain('access_token=123');
    });
  });
});
