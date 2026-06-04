import { apiRequest } from "./api";

const DEFAULT_SYSTEM_IMAGE = "/assets/images/system_card_clear.png";
const DEFAULT_SYSTEM_TITLE = "Untitled system";
const USER_ACCESS_CACHE_MS = 5000;

let userAccessSystems = null;
let userAccessSystemsRequest = null;
let userAccessSystemsFetchedAt = 0;

function readTextValue(value) {
    return typeof value === "string" ? value.trim() : "";
}

function getSystemId(client, index) {
    return readTextValue(client?.id) || readTextValue(client?.base_url) || `${readTextValue(client?.name) || "system"}-${index}`;
}

function getSystemTitle(client) {
    return readTextValue(client?.name) || DEFAULT_SYSTEM_TITLE;
}

function getSystemDescription(client) {
    return readTextValue(client?.description);
}

function getSystemLogo(client) {
    return readTextValue(client?.image_location);
}

function getSystemLink(client) {
    return readTextValue(client?.base_url);
}

function mapClientToSystem(client, index) {
    return {
        id: getSystemId(client, index),
        title: getSystemTitle(client),
        description: getSystemDescription(client),
        imageClear: DEFAULT_SYSTEM_IMAGE,
        logo: getSystemLogo(client),
        link: getSystemLink(client),
    };
}

export async function getUserAccessSystems() {
    const hasRecentSystems = userAccessSystems
        && Date.now() - userAccessSystemsFetchedAt < USER_ACCESS_CACHE_MS;

    if (userAccessSystemsRequest) {
        return userAccessSystemsRequest;
    }

    if (hasRecentSystems) {
        return userAccessSystems;
    }

    userAccessSystemsRequest = apiRequest("/users/access")
        .then((response) => {
            const clients = Array.isArray(response) ? response : [];

            userAccessSystems = clients.map(mapClientToSystem);
            userAccessSystemsFetchedAt = Date.now();

            return userAccessSystems;
        })
        .finally(() => {
            userAccessSystemsRequest = null;
        });

    return userAccessSystemsRequest;
}