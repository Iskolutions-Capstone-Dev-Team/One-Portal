import { apiRequest } from "./api";

const AUTHENTICATOR_LIST_CACHE_MS = 5000;

const authenticatorListCache = new Map();
const authenticatorListRequests = new Map();

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

function getAuthenticatorListCacheKey(email) {
    return readTextValue(email).toLowerCase();
}

function clearAuthenticatorListCache(email) {
    const cacheKey = getAuthenticatorListCacheKey(email);

    if (cacheKey) {
        authenticatorListCache.delete(cacheKey);
        authenticatorListRequests.delete(cacheKey);
    }
}

export async function getMfaSetup(email) {
    const data = await userMfaRequest(`/mfa/setup?email=${encodeURIComponent(email)}`);

    return {
        secret: readTextValue(data.secret),
        otpauthUri: readTextValue(data.otpauth_uri ?? data.otpauthUri),
    };
}

export async function getAuthenticators(email) {
    const cacheKey = getAuthenticatorListCacheKey(email);
    const cachedEntry = authenticatorListCache.get(cacheKey);

    if (authenticatorListRequests.has(cacheKey)) {
        return authenticatorListRequests.get(cacheKey);
    }

    if (cachedEntry && Date.now() - cachedEntry.fetchedAt < AUTHENTICATOR_LIST_CACHE_MS) {
        return cachedEntry.authenticators;
    }

    const request = userMfaRequest(`/mfa/authenticators/list?email=${encodeURIComponent(email)}`)
        .then((data) => {
            const authenticators = Array.isArray(data) ? data.map(normalizeAuthenticator) : [];

            authenticatorListCache.set(cacheKey, {
                authenticators,
                fetchedAt: Date.now(),
            });

            return authenticators;
        })
        .finally(() => {
            authenticatorListRequests.delete(cacheKey);
        });

    authenticatorListRequests.set(cacheKey, request);

    return request;
}

export async function saveAuthenticator({ email, secret, code, name }) {
    const response = await userMfaRequest("/mfa/authenticators", {
        method: "POST",
        data: {
            email: readTextValue(email),
            secret: readTextValue(secret),
            code: readTextValue(code),
            name: readTextValue(name),
        },
    });

    clearAuthenticatorListCache(email);

    return response;
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
    const response = await userMfaRequest("/mfa/authenticators", {
        method: "DELETE",
        data: {
            email: readTextValue(email),
            id: readTextValue(id),
        },
    });

    clearAuthenticatorListCache(email);

    return response;
}