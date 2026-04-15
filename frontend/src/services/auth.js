import { apiRequest, fetchApiResponse, getApiUrl, readApiResponse } from "./api";

const SESSION_REFRESH_TIMESTAMP_KEY = "one-portal:last-session-refresh-at";
const AUTHORIZATION_PATH = "/auth/authorize";
const LANDING_ROUTE_PATH = "/landingRoute";
let authorizationRequestPromise = null;
let authorizationCompletionPromise = null;

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

function getAppUrl(pathname) {
    return new URL(pathname, window.location.origin).toString();
}

function getConfiguredLoginPageUrl() {
    const loginPageUrl = import.meta.env.VITE_LOGIN_PAGE_URL;

    if (loginPageUrl) {
        try {
            return new URL(loginPageUrl).toString();
        } catch (error) {
            console.error("Invalid VITE_LOGIN_PAGE_URL value.", error);
        }
    }

    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    if (redirectUri) {
        try {
            return new URL("/login", redirectUri).toString();
        } catch (error) {
            console.error("Invalid VITE_REDIRECT_URI value.", error);
        }
    }

    return new URL("/login", window.location.origin).toString();
}

export function getLoginPageUrl() {
    const loginUrl = new URL(getConfiguredLoginPageUrl());
    const clientId = import.meta.env.VITE_CLIENT_ID;

    if (clientId) {
        loginUrl.searchParams.set("client_id", clientId);
    }

    return loginUrl.toString();
}

export function getLandingPageUrl() {
    return getAppUrl(LANDING_ROUTE_PATH);
}

export function getLogoutFallbackUrl() {
    return getLandingPageUrl();
}

function isCurrentPage(url) {
    return window.location.href === url;
}

export function navigateToLoginPage() {
    const loginPageUrl = getLoginPageUrl();

    if (isCurrentPage(loginPageUrl)) {
        return false;
    }

    window.location.assign(loginPageUrl);

    return true;
}

function getAuthorizationResponseUrl(data) {
    if (!data || typeof data === "string") {
        return "";
    }

    const authorizationUrl = data.redirect_url ?? data.redirectUrl ?? data.url;

    return typeof authorizationUrl === "string" ? authorizationUrl.trim() : "";
}

function getAuthorizationLocationUrl(response) {
    const location = response.headers.get("location");

    if (!location) {
        return "";
    }

    try {
        return new URL(location, getApiUrl(AUTHORIZATION_PATH)).toString();
    } catch (error) {
        console.error("Invalid authorization redirect URL.", error);
        return "";
    }
}

function createAuthorizationError(status, data) {
    const message = typeof data === "string" && data.trim()
        ? data
        : data?.error ?? data?.message ?? `Request failed with status ${status}`;
    const error = new Error(message);

    error.status = status;
    error.data = data;

    return error;
}

function createMissingAuthorizationRedirectError() {
    const error = new Error("The authorization redirect is unavailable.");

    error.status = 500;

    return error;
}

async function readAuthorizationUrl(response) {
    const locationUrl = getAuthorizationLocationUrl(response);

    if (locationUrl) {
        return locationUrl;
    }

    const data = await readApiResponse(response);

    if (!response.ok) {
        throw createAuthorizationError(response.status, data);
    }

    const authorizationUrl = getAuthorizationResponseUrl(data);

    if (authorizationUrl) {
        return authorizationUrl;
    }

    throw createMissingAuthorizationRedirectError();
}

export async function startAuthorization() {
    if (!authorizationRequestPromise) {
        authorizationRequestPromise = (async () => {
            const response = await fetchApiResponse(AUTHORIZATION_PATH, {
                method: "GET",
                redirect: "manual",
            });
            const authorizationUrl = await readAuthorizationUrl(response);

            window.location.href = authorizationUrl;

            return true;
        })();
    }

    try {
        return await authorizationRequestPromise;
    } finally {
        authorizationRequestPromise = null;
    }
}

export async function completeAuthorization(code) {
    if (!authorizationCompletionPromise) {
        authorizationCompletionPromise = (async () => {
            const data = await apiRequest("/auth/callback", {
                method: "POST",
                data: { code },
            });

            writeSessionRefreshTimestamp();

            return data;
        })();
    }

    try {
        return await authorizationCompletionPromise;
    } finally {
        authorizationCompletionPromise = null;
    }
}

export async function logoutSession() {
    await apiRequest("/auth/logout", {
        method: "POST",
    });

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
