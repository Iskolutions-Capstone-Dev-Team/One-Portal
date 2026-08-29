import { useEffect, useState } from "react";
import OnePortalLayout from "../../../layouts/OnePortalLayout";
import ProfileCard from "../components/ProfileCard";
import AuthenticatorApps from "../components/AuthenticatorApps";
import { clearSessionState, navigateToLandingPage } from "../../../services/auth";
import { createEmptyProfile, getCurrentUserProfile } from "../../../services/userProfile";
import GradientWaves from "../../../components/ui/GradientWaves";
import { usePortalTheme } from "../../../providers/PortalThemeProvider";

export default function Profile() {
    const { isDarkMode } = usePortalTheme();
    const [profile, setProfile] = useState(createEmptyProfile());
    const [profileErrorStatus, setProfileErrorStatus] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

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
            window.removeEventListener('resize', handleResize);
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
            <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 md:px-8 !bg-slate-100 dark:!bg-[#080808] border-none shadow-none font-[Poppins]">
                {/* Background Layer matching Dashboard */}
                <div className="absolute inset-x-0 top-0 h-[45vh] md:h-[55vh] z-0 bg-gradient-to-b from-[#4f0d17] from-50% to-transparent pointer-events-none">
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{ 
                            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 65%, black 100%)', 
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 65%, black 100%)' 
                        }}
                    >
                        <div className="absolute inset-0 scale-y-[-1] overflow-hidden">
                            <GradientWaves
                                className={isDesktop ? "scale-x-[2.5]" : "scale-x-[1.5]"}
                                horizonColor={isDarkMode ? "#080808" : "#f1f5f9"}
                                waveColor="#8a0f18"
                                crestColor="#5c0a10"
                                speed={0.15}
                                amplitude={2.5}
                                waveScale={isDesktop ? 1.5 : 0.9}
                                waveRatio={0.9}
                                swell={35}
                                turbulence={20}
                                tilt={1.11}
                                zoom={1}
                                height={isDesktop ? 12.0 : 14.0}
                                fogDepth={40}
                                detail="medium"
                                brightness={1}
                                opacity={1}
                                mouseInteraction={true}
                                parallaxStrength={0.5}
                                grain={true}
                                grainIntensity={0.05}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-8">
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
