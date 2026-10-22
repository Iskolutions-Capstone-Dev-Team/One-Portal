import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChangePasswordStep } from '../useChangePasswordStep';

describe('useChangePasswordStep hook', () => {
  it('flags error if new password matches current password', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    };

    const { result } = renderHook(() =>
      useChangePasswordStep({
        form,
        setForm: vi.fn(),
        onNext: vi.fn(),
        showCurrentPassword: true,
      })
    );

    expect(result.current.fieldErrors.newPassword).toBe(
      'New password cannot be the same as your current password.'
    );
    expect(result.current.isContinueDisabled).toBe(true);
  });

  it('allows valid new password different from current password', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'BrandNewPassword456!',
      confirmPassword: 'BrandNewPassword456!',
    };

    const { result } = renderHook(() =>
      useChangePasswordStep({
        form,
        setForm: vi.fn(),
        onNext: vi.fn(),
        showCurrentPassword: true,
      })
    );

    expect(result.current.fieldErrors.newPassword).toBeUndefined();
    expect(result.current.isContinueDisabled).toBe(false);
  });

  it('flags error if passwords do not match', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'BrandNewPassword456!',
      confirmPassword: 'DifferentPassword789!',
    };

    const { result } = renderHook(() =>
      useChangePasswordStep({
        form,
        setForm: vi.fn(),
        onNext: vi.fn(),
        showCurrentPassword: true,
      })
    );

    expect(result.current.fieldErrors.confirmPassword).toBe(
      'New password and confirmation password must match.'
    );
    expect(result.current.isContinueDisabled).toBe(true);
  });
});
