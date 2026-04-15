import { useEffect, useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import ProfileCard from "../components/profile/ProfileCard";
import { clearSessionState, navigateToLandingPage } from "../services/auth";
import { createEmptyProfile, getCurrentUserProfile } from "../services/userProfile";

export default function Profile() {
    const [profile, setProfile] = useState(createEmptyProfile());
    const [profileErrorStatus, setProfileErrorStatus] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
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
                </div>
            </main>
        </OnePortalLayout>
    );
}
