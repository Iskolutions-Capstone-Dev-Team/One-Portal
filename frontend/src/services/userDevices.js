import { apiRequest } from "./api";

function getCookieValue(cookieName) {
    if (typeof document === "undefined") {
        return "";
    }
    const cookie = document.cookie
        .split(";")
        .map((cookiePair) => cookiePair.trim())
        .find((cookiePair) => cookiePair.startsWith(`${cookieName}=`));

    if (!cookie) return "";
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

function deviceRequest(path, options = {}) {
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

function normalizeDevice(device = {}) {
    return {
        id: readTextValue(device.id),
        name: readTextValue(device.name),
        browser: readTextValue(device.browser),
        os: readTextValue(device.os),
        ipAddress: readTextValue(device.ip_address ?? device.ipAddress),
        lastUsedAt: readTextValue(device.last_used_at ?? device.lastUsedAt),
        createdAt: readTextValue(device.created_at ?? device.createdAt),
        expiresAt: readTextValue(device.expires_at ?? device.expiresAt),
        userAgent: readTextValue(device.user_agent ?? device.userAgent),
    };
}

export async function getDevices() {
    const data = await deviceRequest("/devices");
    return Array.isArray(data) ? data.map(normalizeDevice) : [];
}

export async function updateDevice({ id, name }) {
    const response = await deviceRequest(`/devices/${encodeURIComponent(id)}`, {
        method: "PATCH",
        data: { name: readTextValue(name) },
    });
    return response;
}

export async function deleteDevice({ id }) {
    const response = await deviceRequest(`/devices/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    return response;
}
