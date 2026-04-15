import { useEffect, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import { formatTimestamp } from "../../utils/formatTimestamp";
import { updateCurrentUserProfile } from "../../services/userProfile";

export default function EditProfileModal({ open, close, profileData, updateProfile, addAuditLog, allowEmailEdit = false }) {
    const [profile, setProfile] = useState({
        id: "",
        firstName: "",
        middleName: "",
        lastName: "",
        nameSuffix: "",
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const personalFields = [
        {
            name: "firstName",
            label: "First Name",
            placeholder: "Enter first name",
            helper: "Max 50 characters",
            required: true,
        },
        {
            name: "lastName",
            label: "Last Name",
            placeholder: "Enter last name",
            helper: "Max 50 characters",
            required: true,
        },
        {
            name: "middleName",
            label: "Middle Name",
            placeholder: "Enter middle name",
            helper: "Max 50 characters",
            required: false,
        },
        {
            name: "nameSuffix",
            label: "Suffix",
            placeholder: "Enter suffix",
            helper: "Optional",
            required: false,
        },
    ];

    const errorMessage = Object.values(errors)[0] ?? "";

    useEffect(() => {
        if (!open) {
            return;
        }

        setErrors({});
        setShowErrorAlert(false);
        setIsSaving(false);

        if (profileData) {
            setProfile(profileData);
        }
    }, [open, profileData]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((prev) => ({ ...prev, [name]: value }));

        setErrors((currentErrors) => {
            if (!currentErrors[name]) {
                return currentErrors;
            }

            const nextErrors = { ...currentErrors };
            delete nextErrors[name];

            if (Object.keys(nextErrors).length === 0) {
                setShowErrorAlert(false);
            }

            return nextErrors;
        });
    };

    const handleSave = async () => {
        const nextErrors = {};

        if (!profile.firstName.trim()) {
            nextErrors.firstName = "First name is required.";
        }

        if (!profile.lastName.trim()) {
            nextErrors.lastName = "Last name is required.";
        }

        if (allowEmailEdit && !profile.email.trim()) {
            nextErrors.email = "Email is required.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setShowErrorAlert(true);
            return;
        }

        setErrors({});
        setShowErrorAlert(false);
        setIsSaving(true);

        try {
            const savedProfile = await updateCurrentUserProfile(profile);

            if (updateProfile) {
                updateProfile(savedProfile);
            }

            if (addAuditLog) {
                addAuditLog({
                    timestamp: formatTimestamp(new Date().toISOString()),
                    action: "PROFILE_UPDATE",
                    details: "Updated profile information",
                    color: "blue",
                });
            }

            close();
        } catch (error) {
            setErrors({
                form: error.message || "Failed to update profile.",
            });
            setShowErrorAlert(true);
        } finally {
            setIsSaving(false);
        }
    };

    if (!open) return null;

    return (
        <dialog className="modal modal-open profile-modal">
            <div className="modal-box profile-modal__box profile-modal__box--wide">
                <div className="profile-modal__hero">
                    <div>
                        <h3 className="profile-modal__title">Edit Profile</h3>
                        <p className="profile-modal__subtitle">Update your personal information</p>
                    </div>

                    <button type="button" className="profile-modal__close" onClick={close} aria-label="Close edit profile modal">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="profile-modal__body">
                    <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
                        {showErrorAlert && errorMessage && (
                            <ErrorAlert
                                message={errorMessage}
                                onClose={() => setShowErrorAlert(false)}
                            />
                        )}

                        <div className="profile-form__grid">
                            {personalFields.map((field) => (
                                <div key={field.name} className="profile-form__field">
                                    <label className="profile-form__label" htmlFor={field.name}>
                                        {field.label}
                                        {field.required && <span className="profile-form__required">*</span>}
                                    </label>

                                    <input id={field.name} type="text" name={field.name} placeholder={field.placeholder} value={profile[field.name]} onChange={handleChange} className={`profile-form__input ${errors[field.name] ? "is-invalid" : ""}`} maxLength={50}/>

                                    <p className={`profile-form__helper ${errors[field.name] ? "is-error" : ""}`}>
                                        {errors[field.name] ?? field.helper}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {allowEmailEdit && (
                            <div className="profile-form__field profile-form__field--full">
                                <label className="profile-form__label" htmlFor="email">
                                    Email Address
                                    <span className="profile-form__required">*</span>
                                </label>

                                <input id="email" type="email" name="email" placeholder="Enter email" value={profile.email} onChange={handleChange} className={`profile-form__input ${errors.email ? "is-invalid" : ""}`}/>

                                <p className={`profile-form__helper ${errors.email ? "is-error" : ""}`}>
                                    {errors.email ?? "Must be an active email account"}
                                </p>
                            </div>
                        )}
                    </form>
                </div>

                <div className="profile-modal__footer">
                    <p className="profile-modal__note">
                        Fields marked with <span className="profile-form__required">*</span> are required
                    </p>

                    <div className="profile-modal__actions">
                        <button type="button" className="profile-action profile-action--secondary" onClick={close}>
                            Cancel
                        </button>
                        <button type="button" className="profile-action profile-action--primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={close}>close</button>
            </form>
        </dialog>
    );
}
