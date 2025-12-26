export type UserRole =
    | "super_admin"
    | "administrator"
    | "editor"
    | "user";

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    lastLogin?: string | null;
}

export interface AuthSuccessResponse {
    success: true;
    user: AuthUser;
    access_token: string;
    expires_at: number; // unix timestamp (seconds)
}

export interface AuthErrorResponse {
    success: false;
    error: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
