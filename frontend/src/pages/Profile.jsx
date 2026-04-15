import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import ProfileCard from "../components/profile/ProfileCard";
import AuditLogs from "../components/profile/AuditLogs";
import { clearSessionState, navigateToLandingPage } from "../services/auth";
import { getRecentAuditLogs } from "../services/logs";

export default function Profile() {
    const [backendLogs, setBackendLogs] = useState([]);
    const [localLogs, setLocalLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [logsError, setLogsError] = useState("");
    const [logsErrorStatus, setLogsErrorStatus] = useState(null);

    const profile = {
        firstName: "Juan",
        middleName: "Miguel",
        lastName: "Dela Cruz",
        email: "juan.delacruz@iskolarngbayan.pup.edu.ph",
    };

    useEffect(() => {
        let isMounted = true;

        const loadLogs = async () => {
            setIsLoadingLogs(true);

            try {
                const recentLogs = await getRecentAuditLogs();

                if (isMounted) {
                    setBackendLogs(recentLogs);
                    setLogsError("");
                    setLogsErrorStatus(null);
                }
            } catch (error) {
                if (isMounted) {
                    setLogsError(error.message);
                    setLogsErrorStatus(error.status ?? null);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingLogs(false);
                }
            }
        };

        loadLogs();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (logsErrorStatus !== 401) {
            return;
        }

        clearSessionState();
        navigateToLandingPage();
    }, [logsErrorStatus]);

    const handleAddAuditLog = (log) => {
        setLocalLogs((currentLogs) => [log, ...currentLogs]);
    };

    const logs = [...localLogs, ...backendLogs];

    if (logsErrorStatus === 401) {
        return null;
    }

    return (
        <OnePortalLayout>
            <main className="profile-page">
                <div className="profile-page__shell">
                    <ProfileCard
                        profile={profile}
                        addAuditLog={handleAddAuditLog}
                        allowEmailEdit={false}
                    />

                    <AuditLogs
                        logs={logs}
                        isLoading={isLoadingLogs}
                        errorMessage={logsError}
                    />
                </div>
            </main>
        </OnePortalLayout>
    );
}
