import { startRegistration } from "@simplewebauthn/browser";

function getPublicKeyOptions(options = {}) {
    return options.publicKey || options;
}

export function createPasskeyCredential(options) {
    return startRegistration({
        optionsJSON: getPublicKeyOptions(options),
    });
}
