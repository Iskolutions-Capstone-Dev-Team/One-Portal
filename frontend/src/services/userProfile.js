import { apiRequest } from "./api";

function readTextValue(value) {
    return typeof value === "string" ? value.trim() : "";
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