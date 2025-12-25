import type { AuthResponse } from "./auth.types";

// function secureLogin
export async function secureLogin(
    email: string,
    password: string
): Promise<AuthResponse> {
    const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;
    const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!PROJECT_REF || !ANON_KEY) {
        console.error("Missing Supabase environment variables");
        return {
            success: false,
            error: "Configuration Error: Missing Supabase Credentials"
        };
    }
    try {
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

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error("Failed to parse response JSON", e);
            return {
                success: false,
                error: `Server Error: ${response.status} ${response.statusText}`
            };
        }

        if (!response.ok) {
            return {
                success: false,
                error: data?.error ?? `Authentication failed (${response.status})`,
            };
        }

        return data as AuthResponse;
    } catch (error: any) {
        console.error("Login request failed", error);
        return {
            success: false,
            error: error.message || "Network request failed"
        };
    }
}
