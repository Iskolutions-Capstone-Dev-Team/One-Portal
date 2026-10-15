import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDevices, updateDevice, deleteDevice } from "../userDevices";
import { apiRequest } from "../api";

vi.mock("../api", () => ({
  apiRequest: vi.fn(),
}));

describe("userDevices service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getDevices returns normalized devices array", async () => {
    apiRequest.mockResolvedValueOnce([
      {
        id: "dev-456",
        name: "Firefox on macOS",
        browser: "Firefox",
        os: "macOS",
        ip_address: "10.0.0.1",
        last_used_at: "2026-10-15T10:00:00Z",
        created_at: "2026-10-15T09:00:00Z",
        expires_at: "2026-10-22T09:00:00Z",
        user_agent: "Mozilla/5.0",
      },
    ]);

    const result = await getDevices();
    expect(apiRequest).toHaveBeenCalledWith("/devices", {});
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "dev-456",
      name: "Firefox on macOS",
      browser: "Firefox",
      os: "macOS",
      ipAddress: "10.0.0.1",
      lastUsedAt: "2026-10-15T10:00:00Z",
      createdAt: "2026-10-15T09:00:00Z",
      expiresAt: "2026-10-22T09:00:00Z",
      userAgent: "Mozilla/5.0",
    });
  });

  it("getDevices handles empty and non-array responses gracefully", async () => {
    apiRequest.mockResolvedValueOnce([]);
    let result = await getDevices();
    expect(result).toEqual([]);

    apiRequest.mockResolvedValueOnce(null);
    result = await getDevices();
    expect(result).toEqual([]);
  });

  it("updateDevice sends PATCH with device name", async () => {
    apiRequest.mockResolvedValueOnce({ message: "Device renamed successfully" });

    const result = await updateDevice({ id: "dev-456", name: "Work Mac" });
    expect(apiRequest).toHaveBeenCalledWith("/devices/dev-456", {
      method: "PATCH",
      data: { name: "Work Mac" },
    });
    expect(result).toEqual({ message: "Device renamed successfully" });
  });

  it("deleteDevice sends DELETE request", async () => {
    apiRequest.mockResolvedValueOnce({ message: "Device deleted successfully" });

    const result = await deleteDevice({ id: "dev-456" });
    expect(apiRequest).toHaveBeenCalledWith("/devices/dev-456", {
      method: "DELETE",
    });
    expect(result).toEqual({ message: "Device deleted successfully" });
  });
});
