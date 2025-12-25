import type { AuthSuccessResponse } from "@/api/auth.types";

const STORAGE_KEY = "auth_session";

export function saveSession(session: AuthSuccessResponse) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): AuthSuccessResponse | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSuccessResponse;

    if (Date.now() / 1000 > session.expires_at) {
        clearSession();
        return null;
    }

    return session;
}

export function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
}
