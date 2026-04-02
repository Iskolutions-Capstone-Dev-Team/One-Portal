import { apiRequest, fetchApiResponse, readApiResponse } from "./api";

export async function startAuthorization() {
    const response = await fetchApiResponse("/auth/authorize", {
        method: "GET",
    });

    if (response.redirected && response.url) {
        window.location.assign(response.url);
        return true;
    }

    if (!response.ok) {
        const data = await readApiResponse(response);
        const error = new Error(
            data?.error ?? data?.message ?? `Authorization failed with status ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return false;
}

export function completeAuthorization(code) {
    return apiRequest("/auth/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
    });
}

export function logoutSession() {
    return apiRequest("/auth/logout", {
        method: "POST",
    });
}

export function refreshSession() {
    return apiRequest("/auth/refresh", {
        method: "POST",
    });
}
