import axios from "axios";

const DEV_API_BASE_URL = "/api/v1";
const apiClient = axios.create({
    withCredentials: true,
});

function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return DEV_API_BASE_URL;
    }

    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizePath(path) {
    return path.startsWith("/") ? path : `/${path}`;
}

function toHeaderObject(headers = {}) {
    const normalizedHeaders = new Headers(headers);
    const headerObject = {};

    normalizedHeaders.forEach((value, key) => {
        headerObject[key] = value;
    });

    return headerObject;
}

function hasHeader(headers, headerName) {
    return Object.keys(headers).some((key) => key.toLowerCase() === headerName.toLowerCase());
}

function buildHeaders(headers = {}, body) {
    const requestHeaders = toHeaderObject(headers);

    if (!hasHeader(requestHeaders, "Accept")) {
        requestHeaders.Accept = "application/json";
    }

    if (body && !(body instanceof FormData) && !hasHeader(requestHeaders, "Content-Type")) {
        requestHeaders["Content-Type"] = "application/json";
    }

    if (!import.meta.env.DEV && import.meta.env.VITE_BACKEND_API_KEY && !hasHeader(requestHeaders, "X-API-Key")) {
        requestHeaders["X-API-Key"] = import.meta.env.VITE_BACKEND_API_KEY;
    }

    return requestHeaders;
}

function getErrorMessage(data, status) {
    if (typeof data === "string" && data.trim()) {
        return data;
    }

    return data?.error ?? data?.message ?? `Request failed with status ${status}`;
}

function createApiError(status, data) {
    const error = new Error(getErrorMessage(data, status));

    error.status = status;
    error.data = data;

    return error;
}

function buildAxiosRequestConfig(options = {}) {
    const { headers, body, data, ...restOptions } = options;
    const requestData = data ?? body;

    return {
        ...restOptions,
        data: requestData,
        headers: buildHeaders(headers, requestData),
    };
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
    try {
        const response = await apiClient.request({
            url: getApiUrl(path),
            validateStatus: () => true,
            ...buildAxiosRequestConfig(options),
        });

        if (response.status < 200 || response.status >= 300) {
            throw createApiError(response.status, response.data);
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                throw createApiError(error.response.status, error.response.data);
            }

            const networkError = new Error(error.message || "Network request failed");
            networkError.cause = error;

            throw networkError;
        }

        throw error;
    }
}