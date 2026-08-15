import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileDetails from "./ProfileDetails";
import ActionButtons from "./ActionButtons";
import { MailIcon } from "./profileIcons";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileCard({ profile, onProfileChange, addAuditLog, allowEmailEdit = false }) {
    const [isEditOpen, setEditOpen] = useState(false);
    const [isPasswordOpen, setPasswordOpen] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(profile);

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
        toast.success("Profile updated successfully!");
    };

    return (
        <>
            <Card className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-white/10 ring-0 ring-offset-0 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 text-center sm:text-left">
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 bg-[#7b0d15] dark:bg-yellow-400 shrink-0 border-0 outline-none ring-0 overflow-hidden after:hidden">
                            <AvatarFallback className="bg-transparent text-[#facc15] dark:text-[#7b0d15] text-xl sm:text-2xl font-extrabold border-0 outline-none">
                                {initials || "?"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">{fullName || "Profile Details"}</h2>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="w-4 h-4"><MailIcon /></span>
                                    {currentProfile.email || "Email unavailable"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <ProfileDetails profile={currentProfile} />
                    <ActionButtons
                        openEdit={() => setEditOpen(true)}
                        openPassword={() => setPasswordOpen(true)}
                    />
            </Card>

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

        </>
    );
}
