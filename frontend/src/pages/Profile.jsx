import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import ProfileCard from "../components/profile/ProfileCard";
import AuthenticatorApps from "../components/profile/AuthenticatorApps";
import { clearSessionState, navigateToLandingPage } from "../services/auth";
import { createEmptyProfile, getCurrentUserProfile } from "../services/userProfile";

export default function Profile() {
    const [profile, setProfile] = useState(createEmptyProfile());
    const [profileErrorStatus, setProfileErrorStatus] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        window.scrollTo({ top: 0, left: 0 });

        const loadProfile = async () => {
            setIsProfileLoading(true);

            try {
                const userProfile = await getCurrentUserProfile();

                if (!isMounted) {
                    return;
                }

                setProfile(userProfile);
                setProfileErrorStatus(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setProfile(createEmptyProfile());
                setProfileErrorStatus(error.status ?? null);
            } finally {
                if (isMounted) {
                    setIsProfileLoading(false);
                }
            }
        };

        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (profileErrorStatus !== 401) {
            return;
        }

        clearSessionState();
        navigateToLandingPage();
    }, [profileErrorStatus]);

    const hasUnauthorizedError = profileErrorStatus === 401;

    if (hasUnauthorizedError) {
        return null;
    }

    return (
        <OnePortalLayout>
            <main className="profile-page">
                <div className="profile-page__shell">
                    <ProfileCard
                        profile={profile}
                        onProfileChange={setProfile}
                        allowEmailEdit={false}
                    />
                    <AuthenticatorApps
                        key={profile.email || "profile-loading"}
                        email={profile.email}
                        isProfileLoading={isProfileLoading}
                    />
                </div>
            </main>
        </OnePortalLayout>
    );
}