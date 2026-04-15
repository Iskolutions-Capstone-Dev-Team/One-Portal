import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import ProfileCard from "../components/profile/ProfileCard";
import AuditLogs from "../components/profile/AuditLogs";
import { clearSessionState, navigateToLandingPage } from "../services/auth";
import { getRecentAuditLogs } from "../services/logs";
import { createEmptyProfile, getCurrentUserProfile } from "../services/userProfile";

export default function Profile() {
    const [profile, setProfile] = useState(createEmptyProfile());
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState("");
    const [profileErrorStatus, setProfileErrorStatus] = useState(null);
    const [backendLogs, setBackendLogs] = useState([]);
    const [localLogs, setLocalLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [logsError, setLogsError] = useState("");
    const [logsErrorStatus, setLogsErrorStatus] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            setIsLoadingProfile(true);

            try {
                const userProfile = await getCurrentUserProfile();

                if (!isMounted) {
                    return;
                }

                setProfile(userProfile);
                setProfileError("");
                setProfileErrorStatus(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setProfile(createEmptyProfile());
                setProfileError(error.message);
                setProfileErrorStatus(error.status ?? null);
            } finally {
                if (isMounted) {
                    setIsLoadingProfile(false);
                }
            }
        };

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

        void loadProfile();
        void loadLogs();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (profileErrorStatus !== 401 && logsErrorStatus !== 401) {
            return;
        }

        clearSessionState();
        navigateToLandingPage();
    }, [profileErrorStatus, logsErrorStatus]);

    const handleAddAuditLog = (log) => {
        setLocalLogs((currentLogs) => [log, ...currentLogs]);
    };

    const hasUnauthorizedError = profileErrorStatus === 401 || logsErrorStatus === 401;
    const logs = [...localLogs, ...backendLogs];
    const pageDescription = profileError
        ? profileError
        : isLoadingProfile
            ? "Loading your account details..."
            : "Review your account details and recent activity in one place.";

    if (hasUnauthorizedError) {
        return null;
    }

    return (
        <OnePortalLayout>
            <main className="profile-page">
                <div className="profile-page__shell">
                    <section className="profile-page__intro">
                        <p className="profile-page__eyebrow">Account Profile</p>
                        <h1 className="profile-page__title">Your Profile</h1>
                        <p className="profile-page__description">{pageDescription}</p>
                    </section>

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