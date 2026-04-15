import { apiRequest } from "./api";

const ANNOUNCEMENT_LIST_KEYS = ["announcements", "data", "items", "results", "list"];

function readTextValue(value) {
    return typeof value === "string" ? value.trim() : "";
}

function readPlainText(value) {
    return readTextValue(value)
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function readFirstText(...values) {
    for (const value of values) {
        const text = readPlainText(value);

        if (text) {
            return text;
        }
    }

    return "";
}

function readFirstLink(...values) {
    for (const value of values) {
        const link = readTextValue(value);

        if (link) {
            return link;
        }
    }

    return "#";
}

function extractAnnouncementList(response) {
    const candidates = [
        response,
        response?.data,
        response?.payload,
        response?.result,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate;
        }

        if (!candidate || typeof candidate !== "object") {
            continue;
        }

        for (const key of ANNOUNCEMENT_LIST_KEYS) {
            if (Array.isArray(candidate[key])) {
                return candidate[key];
            }
        }
    }

    return [];
}

function createAnnouncementId(item, index, title, content, link) {
    const rawId = item?.id ?? item?._id ?? item?.uuid ?? item?.slug ?? item?.announcement_id;

    if (rawId !== undefined && rawId !== null) {
        const normalizedId = String(rawId).trim();

        if (normalizedId) {
            return normalizedId;
        }
    }

    return [title, content, link].filter(Boolean).join("|") || `announcement-${index}`;
}

function normalizeAnnouncement(item, index) {
    if (!item || typeof item !== "object") {
        return null;
    }

    const source = item.attributes && typeof item.attributes === "object"
        ? { ...item, ...item.attributes }
        : item;
    const title = readFirstText(
        source.title,
        source.name,
        source.subject,
        source.header,
        source.announcement_title
    );
    const content = readFirstText(
        source.content,
        source.description,
        source.body,
        source.message,
        source.summary,
        source.excerpt,
        source.announcement_content
    );

    if (!title && !content) {
        return null;
    }

    const link = readFirstLink(
        source.link,
        source.url,
        source.href,
        source.permalink,
        source.target_url
    );

    return {
        id: createAnnouncementId(source, index, title, content, link),
        title: title || "Campus update",
        content: content || "Read the latest campus announcement.",
        link,
    };
}

export async function getAnnouncements() {
    const response = await apiRequest("/announcement");
    const announcements = extractAnnouncementList(response);

    return announcements
        .map(normalizeAnnouncement)
        .filter(Boolean);
}
