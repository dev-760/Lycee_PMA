import type { AuthResponse } from "./auth.types";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!PROJECT_REF || !ANON_KEY) {
    throw new Error("Missing Supabase environment variables");
}

export async function secureLogin(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(
        `https://${PROJECT_REF}.functions.supabase.co/secure-login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ANON_KEY}`
            },
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
