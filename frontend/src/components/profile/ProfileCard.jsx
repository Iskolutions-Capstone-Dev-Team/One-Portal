import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileDetails from "./ProfileDetails";
import ActionButtons from "./ActionButtons";
import SuccessAlert from "../SuccessAlert";

export default function ProfileCard({ profile, onProfileChange, addAuditLog, allowEmailEdit = false }) {
    const [isEditOpen, setEditOpen] = useState(false);
    const [isPasswordOpen, setPasswordOpen] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        setCurrentProfile(profile);
    }, [profile]);

    const fullName = [
        currentProfile.firstName,
        currentProfile.middleName,
        currentProfile.lastName,
        currentProfile.nameSuffix,
    ]
        .filter(Boolean)
        .join(" ");

    const initials = [currentProfile.firstName, currentProfile.lastName]
        .filter(Boolean)
        .map((value) => value.charAt(0))
        .join("")
        .toUpperCase();

    const handleProfileUpdate = (updatedProfile) => {
        setCurrentProfile(updatedProfile);
        onProfileChange?.(updatedProfile);
        setToastMessage("Profile updated successfully!");
    };

    return (
        <>
            <section className="profile-card">
                <div className="profile-card__hero">
                    <div className="profile-card__identity">
                        <div className="profile-card__avatar" aria-hidden="true">
                            {initials || "?"}
                        </div>

                        <div className="profile-card__summary">
                            <h2 className="profile-card__name">{fullName || "Profile details"}</h2>

                            <div className="profile-card__chips">
                                <span className="profile-card__chip">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    {currentProfile.email || "Email unavailable"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card__body">
                    <ProfileDetails profile={currentProfile} />
                    <ActionButtons
                        openEdit={() => setEditOpen(true)}
                        openPassword={() => setPasswordOpen(true)}
                    />
                </div>
            </section>

            <EditProfileModal
                open={isEditOpen}
                close={() => setEditOpen(false)}
                profileData={currentProfile}
                updateProfile={handleProfileUpdate}
                addAuditLog={addAuditLog}
                allowEmailEdit={allowEmailEdit}
            />

            <ChangePasswordModal
                isOpen={isPasswordOpen}
                onClose={() => setPasswordOpen(false)}
                email={currentProfile.email}
                showCurrentPassword={true}
                addAuditLog={addAuditLog}
                enableSuccessAlert={true}
            />

            <SuccessAlert
                message={toastMessage}
                onClose={() => setToastMessage("")}
            />
        </>
    );
}
