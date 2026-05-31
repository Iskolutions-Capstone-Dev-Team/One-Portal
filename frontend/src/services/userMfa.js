import { apiRequest } from "./api";

function getCookieValue(cookieName) {
    if (typeof document === "undefined") {
        return "";
    }

    const cookie = document.cookie
        .split(";")
        .map((cookiePair) => cookiePair.trim())
        .find((cookiePair) => cookiePair.startsWith(`${cookieName}=`));

    if (!cookie) {
        return "";
    }

    const value = cookie.split("=").slice(1).join("=");

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function getAuthorizationHeaders() {
    const accessToken = getCookieValue("access_token");

    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function userMfaRequest(path, options = {}) {
    return apiRequest(path, {
        ...options,
        headers: {
            ...getAuthorizationHeaders(),
            ...options.headers,
        },
    });
}

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
    const data = await userMfaRequest(`/mfa/setup?email=${encodeURIComponent(email)}`);

    return {
        secret: readTextValue(data.secret),
        otpauthUri: readTextValue(data.otpauth_uri ?? data.otpauthUri),
    };
}

export async function getAuthenticators(email) {
    const data = await userMfaRequest(`/mfa/authenticators/list?email=${encodeURIComponent(email)}`);

    return Array.isArray(data) ? data.map(normalizeAuthenticator) : [];
}

export async function saveAuthenticator({ email, secret, code, name }) {
    return userMfaRequest("/mfa/authenticators", {
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
    return userMfaRequest("/mfa/verify", {
        method: "POST",
        data: {
            email: readTextValue(email),
            code: readTextValue(code),
        },
    });
}

export async function deleteAuthenticator({ email, id }) {
    return userMfaRequest("/mfa/authenticators", {
        method: "DELETE",
        data: {
            email: readTextValue(email),
            id: readTextValue(id),
        },
    });
}
