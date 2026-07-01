import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActionButtons from '../ActionButtons';

describe('ActionButtons Component', () => {
  it('renders buttons', () => {
    const onEditProfile = vi.fn();
    const onChangePassword = vi.fn();
    
    render(<ActionButtons onEditProfile={onEditProfile} onChangePassword={onChangePassword} />);
    
    expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
  });
});
