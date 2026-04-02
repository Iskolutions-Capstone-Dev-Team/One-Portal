import { apiRequest, fetchApiResponse, readApiResponse } from "./api";

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

export function completeAuthorization(code) {
    return apiRequest("/auth/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
    });
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

export function refreshSession() {
    return apiRequest("/auth/refresh", {
        method: "POST",
    });
}