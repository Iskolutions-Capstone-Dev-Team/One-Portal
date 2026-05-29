import { apiRequest } from "./api";

function readTextValue(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeAuthenticator(authenticator = {}) {
    return {
        id: readTextValue(authenticator.id),
        type: readTextValue(authenticator.type),
        name: readTextValue(authenticator.name),
        createdAt: readTextValue(authenticator.created_at ?? authenticator.createdAt),
        lastUsedAt: readTextValue(authenticator.last_used_at ?? authenticator.lastUsedAt),
    };
}

export async function getMfaSetup(email) {
    const data = await apiRequest(`/mfa/setup?email=${encodeURIComponent(email)}`);

    return {
        secret: readTextValue(data.secret),
        otpauthUri: readTextValue(data.otpauth_uri ?? data.otpauthUri),
    };
}

export async function getAuthenticators(email) {
    const data = await apiRequest(`/mfa/authenticators/list?email=${encodeURIComponent(email)}`);

    return Array.isArray(data) ? data.map(normalizeAuthenticator) : [];
}

export async function saveAuthenticator({ email, secret, code, name }) {
    return apiRequest("/mfa/authenticators", {
        method: "POST",
        data: {
            email: readTextValue(email),
            secret: readTextValue(secret),
            code: readTextValue(code),
            name: readTextValue(name),
        },
    });
}

export async function verifyMfaCode({ email, code }) {
    return apiRequest("/mfa/verify", {
        method: "POST",
        data: {
            email: readTextValue(email),
            code: readTextValue(code),
        },
    });
}

export async function deleteAuthenticator({ email, id }) {
    return apiRequest("/mfa/authenticators", {
        method: "DELETE",
        data: {
            email: readTextValue(email),
            id: readTextValue(id),
        },
    });
}
