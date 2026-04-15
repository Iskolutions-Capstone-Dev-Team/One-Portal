import { apiRequest } from "./api";

function readTextValue(value) {
    return typeof value === "string" ? value.trim() : "";
}

function buildUserNamePayload(profile = {}) {
    return {
        first_name: readTextValue(profile.firstName),
        middle_name: readTextValue(profile.middleName),
        last_name: readTextValue(profile.lastName),
        name_suffix: readTextValue(profile.nameSuffix),
    };
}

export function createEmptyProfile() {
    return {
        id: "",
        firstName: "",
        middleName: "",
        lastName: "",
        nameSuffix: "",
        email: "",
    };
}

export function mapUserInfoToProfile(userInfo = {}) {
    return {
        id: readTextValue(userInfo.id),
        firstName: readTextValue(userInfo.first_name ?? userInfo.firstName),
        middleName: readTextValue(userInfo.middle_name ?? userInfo.middleName),
        lastName: readTextValue(userInfo.last_name ?? userInfo.lastName),
        nameSuffix: readTextValue(userInfo.name_suffix ?? userInfo.nameSuffix),
        email: readTextValue(userInfo.email),
    };
}

export async function getCurrentUserProfile() {
    const response = await apiRequest("/userinfo");

    return mapUserInfoToProfile(response);
}

export async function updateCurrentUserProfile(profile) {
    const userId = readTextValue(profile?.id);

    if (!userId) {
        throw new Error("User ID is required to update the profile.");
    }

    await apiRequest(`/user/${userId}/name`, {
        method: "PATCH",
        data: buildUserNamePayload(profile),
    });

    return {
        ...createEmptyProfile(),
        id: userId,
        firstName: readTextValue(profile.firstName),
        middleName: readTextValue(profile.middleName),
        lastName: readTextValue(profile.lastName),
        nameSuffix: readTextValue(profile.nameSuffix),
        email: readTextValue(profile.email),
    };
}
