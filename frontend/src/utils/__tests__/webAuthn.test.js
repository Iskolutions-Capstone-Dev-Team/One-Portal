import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startRegistration } from '@simplewebauthn/browser';
import { createPasskeyCredential } from '../webAuthn';

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn()
}));

describe('webAuthn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls startRegistration with publicKey', async () => {
    startRegistration.mockResolvedValue({ id: 'cred-id' });
    
    const options = { publicKey: { challenge: 'abc' } };
    const result = await createPasskeyCredential(options);
    
    expect(startRegistration).toHaveBeenCalledWith({ optionsJSON: options.publicKey });
    expect(result).toEqual({ id: 'cred-id' });
  });

  it('handles options that are directly the public key', async () => {
    startRegistration.mockResolvedValue({ id: 'cred-id' });
    
    const options = { challenge: 'abc' }; // direct
    await createPasskeyCredential(options);
    
    expect(startRegistration).toHaveBeenCalledWith({ optionsJSON: options });
  });
});
