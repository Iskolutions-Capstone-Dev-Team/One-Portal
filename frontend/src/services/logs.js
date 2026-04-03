import { apiRequest } from "./api";
import { formatTimestamp } from "../utils/formatTimestamp";

const SUCCESS_RESULTS = new Set(["ok", "success", "passed"]);
const WARNING_RESULTS = new Set(["fail", "failed", "error"]);

function formatAction(action) {
    if (!action) {
        return "Unknown Action";
    }

    return action
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getLogColor(result) {
    const normalizedResult = result?.toLowerCase();

    if (SUCCESS_RESULTS.has(normalizedResult)) {
        return "green";
    }

    if (WARNING_RESULTS.has(normalizedResult)) {
        return "yellow";
    }

    return "gray";
}

function buildLogDetails(log) {
    const parts = [formatAction(log.action)];

    if (log.actor) {
        parts.push(`by ${log.actor}`);
    }

    if (log.result) {
        parts.push(`(${log.result})`);
    }

    return parts.join(" ");
}

export function mapLogToAuditEntry(log) {
    return {
        id: log.id,
        timestamp: formatTimestamp(log.created_at),
        action: log.action,
        details: buildLogDetails(log),
        color: getLogColor(log.result),
    };
}

export async function getRecentAuditLogs(limit = 10) {
    const params = new URLSearchParams({
        limit: String(limit),
        offset: "0",
    });

    const response = await apiRequest(`/logs?${params.toString()}`);
    const logs = Array.isArray(response?.logs) ? response.logs : [];

    return logs.map(mapLogToAuditEntry);
}
