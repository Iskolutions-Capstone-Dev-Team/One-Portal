import { useState } from "react";
import ErrorAlert from "../ErrorAlert";

export default function ChangePasswordStep({
    form,
    setForm,
    onNext,
    onClose,
    showCurrentPassword = true,
    errorMessage = "",
    isSubmitting = false,
    onClearError,
}) {
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [showValidationError, setShowValidationError] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const password = form.newPassword || "";
    const requirements = [
        { key: "length", label: "At least 8 characters", valid: password.length >= 8 },
        { key: "uppercase", label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { key: "number", label: "One number", valid: /[0-9]/.test(password) },
        { key: "special", label: "One special character", valid: /[!@#$%^&*(),.?\":{}|<>]/.test(password) },
    ];

    const fields = showCurrentPassword
        ? ["currentPassword", "newPassword", "confirmPassword"]
        : ["newPassword", "confirmPassword"];

    const fieldErrors = {};

    if (showCurrentPassword && !form.currentPassword.trim()) {
        fieldErrors.currentPassword = "Current password is required.";
    }

    if (!form.newPassword.trim()) {
        fieldErrors.newPassword = "New password is required.";
    } else if (!requirements.every((requirement) => requirement.valid)) {
        fieldErrors.newPassword = "Use at least 8 characters with an uppercase letter, number, and special character.";
    }

    if (!form.confirmPassword.trim()) {
        fieldErrors.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword.trim() && form.newPassword !== form.confirmPassword) {
        fieldErrors.confirmPassword = "New password and confirmation password must match.";
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        onClearError?.();
    };

    const toggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleNext = () => {
        if (Object.keys(fieldErrors).length > 0) {
            setShowValidationError(true);
            setShowErrorAlert(true);
            return;
        }

        setShowValidationError(false);
        setShowErrorAlert(false);
        onNext();
    };

    const getFieldLabel = (field) => {
        if (field === "currentPassword") return "Current Password";
        if (field === "newPassword") return "New Password";
        return "Confirm New Password";
    };

    const getFieldPlaceholder = (field) => {
        if (field === "currentPassword") return "Enter current password";
        if (field === "newPassword") return "Enter new password";
        return "Confirm new password";
    };

    const isFieldInvalid = (field) => {
        return showValidationError && Boolean(fieldErrors[field]);
    };

    const isContinueDisabled = Object.keys(fieldErrors).length > 0 || isSubmitting;
    const alertMessage = Object.values(fieldErrors)[0] ?? "";

    return (
        <section className="profile-modal__surface">
            <div className="profile-modal__hero">
                <div>
                    <h3 className="profile-modal__title">Change Password</h3>
                    <p className="profile-modal__subtitle">Secure your account with a new password</p>
                </div>

                <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Close change password modal">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="profile-modal__body">
                <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
                    {errorMessage && (
                        <ErrorAlert
                            message={errorMessage}
                            onClose={onClearError}
                        />
                    )}

                    {showErrorAlert && showValidationError && alertMessage && (
                        <ErrorAlert
                            message={alertMessage}
                            onClose={() => setShowErrorAlert(false)}
                        />
                    )}

                    <div className="profile-form__stack">
                        {fields.map((field) => (
                            <div className="profile-form__field" key={field}>
                                <label className="profile-form__label" htmlFor={field}>
                                    {getFieldLabel(field)}
                                    <span className="profile-form__required">*</span>
                                </label>

                                <div className="profile-form__input-wrap">
                                    <input id={field} value={form[field]} type={showPassword[field] ? "text" : "password"} name={field} placeholder={getFieldPlaceholder(field)} className={`profile-form__input ${isFieldInvalid(field) ? "is-invalid" : ""}`} onChange={handleChange} aria-invalid={isFieldInvalid(field)}/>

                                    <button type="button" className="profile-form__toggle" onClick={() => toggleShowPassword(field)} aria-label={`Toggle ${getFieldLabel(field)} visibility`}>
                                        {showPassword[field] ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 012.293-3.607M6.72 6.72A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 01-4.563 5.956M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {showValidationError && fieldErrors[field] && (
                                    <p className="profile-form__helper is-error">{fieldErrors[field]}</p>
                                )}

                                {field === "newPassword" && (
                                    <div className="profile-checklist">
                                        {requirements.map((requirement) => (
                                            <p key={requirement.key} className={`profile-checklist__item ${requirement.valid ? "is-valid" : ""}`}>
                                                <span className="profile-checklist__indicator">{requirement.valid ? "OK" : "-"}</span>
                                                {requirement.label}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </form>
            </div>

            <div className="profile-modal__footer">
                <p className="profile-modal__note">
                    <span className="profile-form__required">*</span> Required fields
                </p>

                <div className="profile-modal__actions">
                    <button type="button" className="profile-action profile-action--secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="profile-action profile-action--primary" onClick={handleNext} disabled={isContinueDisabled}>
                        {isSubmitting ? "Sending OTP..." : "Continue"}
                    </button>
                </div>
            </div>
        </section>
    );
}
