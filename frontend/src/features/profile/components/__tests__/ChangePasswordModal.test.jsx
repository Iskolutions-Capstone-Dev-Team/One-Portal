import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChangePasswordModal from '../ChangePasswordModal';

const queryClient = new QueryClient();

describe('ChangePasswordModal Component', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <ChangePasswordModal isOpen={true} onClose={vi.fn()} />
            </QueryClientProvider>
        );
        expect(container).toBeInTheDocument();
    });
});
