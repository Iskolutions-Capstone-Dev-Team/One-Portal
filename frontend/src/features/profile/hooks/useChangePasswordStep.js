import { useState } from "react";

export function useChangePasswordStep({ form, setForm, onNext, showCurrentPassword, isSubmitting, onClearError }) {
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

    return {
        showPassword,
        showValidationError,
        setShowValidationError,
        showErrorAlert,
        setShowErrorAlert,
        requirements,
        fields,
        fieldErrors,
        handleChange,
        toggleShowPassword,
        handleNext,
        getFieldLabel,
        getFieldPlaceholder,
        isFieldInvalid,
        isContinueDisabled,
        alertMessage
    };
}
