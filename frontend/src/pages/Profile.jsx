import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import ProfileCard from "../components/profile/ProfileCard";
import AuditLogs from "../components/profile/AuditLogs";
import { getRecentAuditLogs } from "../services/logs";

export default function Profile() {
    const [backendLogs, setBackendLogs] = useState([]);
    const [localLogs, setLocalLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [logsError, setLogsError] = useState("");

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
                }
            } catch (error) {
                if (isMounted) {
                    setLogsError(error.message);
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

    const handleAddAuditLog = (log) => {
        setLocalLogs((currentLogs) => [log, ...currentLogs]);
    };

    const logs = [...localLogs, ...backendLogs];

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
