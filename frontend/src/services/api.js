const DEV_API_BASE_URL = "/api/v1";

function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return DEV_API_BASE_URL;
    }

    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizePath(path) {
    return path.startsWith("/") ? path : `/${path}`;
}

function buildHeaders(headers = {}, body) {
    const requestHeaders = new Headers(headers);

    requestHeaders.set("Accept", "application/json");

    if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
    }

    if (!import.meta.env.DEV && import.meta.env.VITE_BACKEND_API_KEY && !requestHeaders.has("X-API-Key")) {
        requestHeaders.set("X-API-Key", import.meta.env.VITE_BACKEND_API_KEY);
    }

    return requestHeaders;
}

export function getApiUrl(path) {
    const normalizedPath = normalizePath(path);
    const baseUrl = import.meta.env.DEV
        ? DEV_API_BASE_URL
        : normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

    return `${baseUrl}${normalizedPath}`;
}

export async function readApiResponse(response) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
}

export async function fetchApiResponse(path, options = {}) {
    const { headers, body, ...restOptions } = options;

    return fetch(getApiUrl(path), {
        ...restOptions,
        body,
        credentials: "include",
        headers: buildHeaders(headers, body),
    });
}

export async function apiRequest(path, options = {}) {
    const response = await fetchApiResponse(path, options);
    const data = await readApiResponse(response);

    if (!response.ok) {
        const error = new Error(
            data?.error ?? data?.message ?? `Request failed with status ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}
