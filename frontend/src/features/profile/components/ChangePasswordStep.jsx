import { useState } from "react";
import ErrorAlert from "../../../components/feedback/ErrorAlert";
import { CloseIcon, EyeIcon, EyeSlashIcon } from "./profileIcons";

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
        { key: "special", label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
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
                    <CloseIcon />
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
                                            <EyeSlashIcon />
                                        ) : (
                                            <EyeIcon />
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
