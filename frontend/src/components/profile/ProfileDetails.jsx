export default function ProfileDetails({ profile }) {
    const detailFields = [
        { id: "firstName", label: "First Name", value: profile.firstName },
        { id: "lastName", label: "Last Name", value: profile.lastName },
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
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
