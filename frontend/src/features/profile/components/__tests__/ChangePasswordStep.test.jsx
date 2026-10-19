import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog } from '@/components/ui/dialog';
import ChangePasswordStep from '../ChangePasswordStep';

function renderInDialog(ui) {
  return render(
    <Dialog open={true}>
      {ui}
    </Dialog>
  );
}

describe('ChangePasswordStep Component', () => {
  it('renders without crashing', () => {
    const { container } = renderInDialog(
      <ChangePasswordStep
        form={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        setForm={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders warning message when new password matches current password', () => {
    const form = {
      currentPassword: 'Password123!',
      newPassword: 'Password123!',
      confirmPassword: '',
    };
    renderInDialog(
      <ChangePasswordStep
        form={form}
        setForm={vi.fn()}
        showCurrentPassword={true}
      />
    );
    expect(
      screen.getByText('New password cannot be the same as your current password.')
    ).toBeInTheDocument();
  });


  it('renders hint indicating password cannot match last 5 passwords', () => {
    renderInDialog(
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
    renderInDialog(
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
