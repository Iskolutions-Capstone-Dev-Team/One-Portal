import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ChangePasswordStep from '../ChangePasswordStep';

function renderWithDialog(ui) {
  return render(
    <Dialog open={true}>
      <DialogContent>{ui}</DialogContent>
    </Dialog>
  );
}

describe('ChangePasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = renderWithDialog(
      <ChangePasswordStep
        form={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        setForm={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders warning when new password matches current password and disables continue', () => {
    const form = {
      currentPassword: 'CurrentPassword123!',
      newPassword: 'CurrentPassword123!',
      confirmPassword: 'CurrentPassword123!',
    };

    renderWithDialog(
      <ChangePasswordStep
        form={form}
        setForm={vi.fn()}
        showCurrentPassword={true}
      />
    );

    expect(
      screen.getByText('New password cannot be the same as your current password.')
    ).toBeInTheDocument();

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when new password is valid and different from current password', () => {
    const form = {
      currentPassword: 'CurrentPassword123!',
      newPassword: 'BrandNewPassword456!',
      confirmPassword: 'BrandNewPassword456!',
    };

    renderWithDialog(
      <ChangePasswordStep
        form={form}
        setForm={vi.fn()}
        showCurrentPassword={true}
      />
    );

    expect(
      screen.queryByText('New password cannot be the same as your current password.')
    ).not.toBeInTheDocument();

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
  });

  it('renders hint indicating password cannot match last 5 passwords', () => {
    renderWithDialog(
      <ChangePasswordStep
        form={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        setForm={vi.fn()}
      />
    );
    expect(
      screen.getByText('Must be different from your last 5 passwords.')
    ).toBeInTheDocument();
  });

  it('displays errorMessage alert when provided', () => {
    renderWithDialog(
      <ChangePasswordStep
        form={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        setForm={vi.fn()}
        errorMessage="You cannot reuse any of your last 5 passwords."
      />
    );
    expect(
      screen.getByText('You cannot reuse any of your last 5 passwords.')
    ).toBeInTheDocument();
  });
});
