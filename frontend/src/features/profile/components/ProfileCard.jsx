import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileDetails from "./ProfileDetails";
import ActionButtons from "./ActionButtons";
import { MailIcon } from "./profileIcons";
import SuccessAlert from "../../../components/feedback/SuccessAlert";

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
                            <h2 className="profile-card__name">{fullName || "Profile Details"}</h2>

                            <div className="profile-card__chips">
                                <span className="profile-card__chip">
                                    <MailIcon />
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
