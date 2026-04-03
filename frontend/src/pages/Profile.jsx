import { useState } from "react";
import OnePortalLayout from "../layouts/OnePortalLayout";
import ProfileCard from "../components/profile/ProfileCard";
import AuditLogs from "../components/profile/AuditLogs";

export default function Profile() {
    const [logs, setLogs] = useState([
        { timestamp: "2024-01-20 14:25:10", action: "PROFILE_UPDATE", details: "Updated email address", color: "blue" },
        { timestamp: "2024-01-18 09:15:22", action: "LOGIN_SUCCESS", details: "Successful login", color: "green" },
        { timestamp: "2024-01-15 16:45:33", action: "PASSWORD_CHANGE", details: "Password changed", color: "yellow" },
        { timestamp: "2024-01-10 11:20:45", action: "ROLE_ASSIGNED", details: "Assigned student role", color: "purple" },
        { timestamp: "2023-08-15 10:30:45", action: "ACCOUNT_CREATED", details: "Account created", color: "gray" },
    ]);

    const profile = {
        firstName: "Juan",
        middleName: "Miguel",
        lastName: "Dela Cruz",
        email: "juan.delacruz@iskolarngbayan.pup.edu.ph",
    };

    const handleAddAuditLog = (log) => {
        setLogs((prev) => [log, ...prev]);
    };

    return (
        <OnePortalLayout>
            <main className="profile-page">
                <div className="profile-page__shell">
                    <ProfileCard
                        profile={profile}
                        addAuditLog={handleAddAuditLog}
                        allowEmailEdit={false}
                    />

                    <AuditLogs logs={logs} />
                </div>
            </main>
        </OnePortalLayout>
    );
}