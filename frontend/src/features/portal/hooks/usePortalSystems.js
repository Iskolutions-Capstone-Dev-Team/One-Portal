import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserAccessSystems } from '../../../services/userAccess';
import { clearSessionState, navigateToLandingPage } from '../../../services/auth';

export function usePortalSystems() {
    const { data: availableSystems = [], error, isLoading: isLoadingSystems } = useQuery({
        queryKey: ['user_access_systems'],
        queryFn: getUserAccessSystems,
        refetchOnWindowFocus: true,
        retry: false,
    });

    const systemsError = error ? (error.message || "We couldn't load your systems right now.") : "";
    const systemsErrorStatus = error ? (error.status ?? error.response?.status ?? null) : null;

    useEffect(() => {
        if (systemsErrorStatus !== 401) {
            return;
        }

        clearSessionState();
        navigateToLandingPage();
    }, [systemsErrorStatus]);

    return {
        availableSystems,
        isLoadingSystems,
        systemsError,
        systemsErrorStatus
    };
}
