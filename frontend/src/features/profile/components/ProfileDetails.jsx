import { UserCircleIcon } from "./profileIcons";

export default function ProfileDetails({ profile }) {
    const detailFields = [
        { id: "firstName", label: "First Name", value: profile.firstName ?? "", keepBlank: true },
        { id: "lastName", label: "Last Name", value: profile.lastName ?? "", keepBlank: true },
        { id: "middleName", label: "Middle Name", value: profile.middleName ?? "", keepBlank: true },
        { id: "nameSuffix", label: "Suffix", value: profile.nameSuffix ?? "", keepBlank: true },
    ];

    return (
        <section className="profile-details">
            <div className="profile-details__grid">
                {detailFields.map((field) => (
                    <div key={field.id} className="profile-detail-card">
                        <div className="profile-detail-card__label">
                            <span className="profile-detail-card__icon" aria-hidden="true">
                                <UserCircleIcon />
                            </span>
                            <span>{field.label}</span>
                        </div>

                        <div className="profile-detail-card__value" id={field.id}>
                            {field.value || (field.keepBlank ? <span className="profile-detail-card__empty" aria-hidden="true">&nbsp;</span> : "Not available")}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}