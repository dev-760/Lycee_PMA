import type { AuthResponse } from "./auth.types";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;

if (!PROJECT_REF) {
    throw new Error("Missing VITE_SUPABASE_PROJECT_REF");
}

export async function secureLogin(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(
        `https://${PROJECT_REF}.functions.supabase.co/secure-login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        return {
            success: false,
            error: data?.error ?? "Authentication failed",
        };
    }

    return data as AuthResponse;
}
