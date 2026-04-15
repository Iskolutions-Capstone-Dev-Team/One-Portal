import { apiRequest } from "./api";

function readTextValue(value) {
    return typeof value === "string" ? value.trim() : "";
}

export async function sendProfileOtp(email) {
    await apiRequest("/otp/send", {
        method: "POST",
        data: {
            email: readTextValue(email),
        },
    });
}

export async function verifyProfileOtp(email, otp) {
    await apiRequest("/otp/verify", {
        method: "POST",
        data: {
            email: readTextValue(email),
            otp: readTextValue(otp),
        },
    });
}

export async function changeCurrentUserPassword({ currentPassword, newPassword }) {
    await apiRequest("/user/password/change", {
        method: "PATCH",
        data: {
            old_password: readTextValue(currentPassword),
            new_password: readTextValue(newPassword),
        },
    });
}
