import { apiRequest, fetchApiResponse, readApiResponse } from "./api";

const SESSION_REFRESH_TIMESTAMP_KEY = "one-portal:last-session-refresh-at";

function hasLocalStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSessionRefreshTimestamp() {
    if (!hasLocalStorage()) {
        return null;
    }

    const storedValue = Number(window.localStorage.getItem(SESSION_REFRESH_TIMESTAMP_KEY));

    if (!Number.isFinite(storedValue) || storedValue <= 0) {
        return null;
    }

    return storedValue;
}

function writeSessionRefreshTimestamp(timestamp = Date.now()) {
    if (!hasLocalStorage()) {
        return;
    }

    window.localStorage.setItem(SESSION_REFRESH_TIMESTAMP_KEY, String(timestamp));
}

function getResponseRedirectUrl(response) {
    if (!response.redirected || !response.url) {
        return null;
    }

    return response.url;
}

function createAuthError(response, data) {
    const error = new Error(
        data?.error ?? data?.message ?? `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    return error;
}

export function getLogoutFallbackUrl() {
    return new URL("/", window.location.origin).toString();
}

export async function startAuthorization() {
    const response = await fetchApiResponse("/auth/authorize", {
        method: "GET",
    });

    const redirectUrl = getResponseRedirectUrl(response);

    if (redirectUrl) {
        window.location.assign(redirectUrl);
        return true;
    }

    if (!response.ok) {
        const data = await readApiResponse(response);
        throw createAuthError(response, data);
    }

    return false;
}

export async function completeAuthorization(code) {
    const data = await apiRequest("/auth/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
    });

    writeSessionRefreshTimestamp();

    return data;
}

export async function logoutSession() {
    const response = await fetchApiResponse("/auth/logout", {
        method: "POST",
    });

    const redirectUrl = getResponseRedirectUrl(response);

    if (redirectUrl) {
        return redirectUrl;
    }

    const data = await readApiResponse(response);

    if (!response.ok) {
        throw createAuthError(response, data);
    }

    return getLogoutFallbackUrl();
}

export async function refreshSession() {
    const data = await apiRequest("/auth/refresh", {
        method: "POST",
    });

    writeSessionRefreshTimestamp();

    return data;
}

export function clearSessionRefreshTimestamp() {
    if (!hasLocalStorage()) {
        return;
    }

    window.localStorage.removeItem(SESSION_REFRESH_TIMESTAMP_KEY);
}

export function getSessionRefreshDelay(refreshIntervalMs) {
    const lastRefreshTimestamp = readSessionRefreshTimestamp();

    if (!lastRefreshTimestamp) {
        return refreshIntervalMs;
    }

    const elapsedTime = Date.now() - lastRefreshTimestamp;
    return Math.max(0, refreshIntervalMs - elapsedTime);
}