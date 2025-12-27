import type { AuthResponse, AuthSuccessResponse } from "./auth.types";

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

    // Normalize email to avoid case-sensitivity and whitespace issues
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const response = await fetch(
            `https://${PROJECT_REF}.functions.supabase.co/secure-login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ANON_KEY}`
                },
                body: JSON.stringify({ email: normalizedEmail, password }),
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

        // Check HTTP status first
        if (!response.ok) {
            console.error("Login HTTP error:", response.status, data);
            return {
                success: false,
                error: data?.error ?? `Authentication failed (${response.status})`,
            };
        }

        // Log the full response for debugging (dev only)
        if (import.meta.env.DEV) {
            console.log("Edge Function response:", {
                status: response.status,
                statusText: response.statusText,
                data: data,
                dataKeys: data ? Object.keys(data) : null
            });
        }

        // Validate response structure
        if (!data || typeof data !== 'object') {
            console.error("Invalid response structure:", data);
            return {
                success: false,
                error: "Invalid response from server"
            };
        }

        // If the response has success: false, return it as-is
        if (data.success === false) {
            console.error("Login failed:", data.error);
            return {
                success: false,
                error: data.error || "Invalid username or password"
            };
        }

        // If the response has success: true, validate and return it directly
        if (data.success === true) {
            // Validate the response structure
            if (data.user && data.access_token) {
                // Login success - role extracted from Edge Function
                return data as AuthResponse;
            } else {
                console.error("Success response missing required fields:", data);
                return {
                    success: false,
                    error: "Invalid response format: missing user or token"
                };
            }
        }

        // Check for user object - if present, treat as success (even without explicit success field)
        const user = data.user || data.User || data.userData;

        if (user) {
            // Look for access token in various possible locations
            const accessToken =
                data.access_token ||
                data.accessToken ||
                data.token ||
                data.session?.access_token ||
                data.session?.accessToken ||
                data.session?.token;

            // Look for expires_at in various locations
            const expiresAt =
                data.expires_at ||
                data.expiresAt ||
                data.expires ||
                data.session?.expires_at ||
                data.session?.expiresAt ||
                data.session?.expires ||
                (Date.now() / 1000 + 3600); // Default 1 hour if not provided

            // Extract user role - prioritize role from Edge Function response
            // The Edge Function returns the role directly in data.user.role
            let userRole =
                data.user?.role ||           // From Edge Function response (preferred)
                user.role ||                 // Direct from user object
                user.app_metadata?.role ||   // From metadata (fallback)
                user.user_metadata?.role ||  // From metadata (fallback)
                data.role;                   // From top level (fallback)

            // Normalize role - ensure it's a valid UserRole
            // If role is 'authenticated' (Supabase Auth default), it's invalid for our app
            if (!userRole || userRole === 'authenticated') {
                console.warn("Invalid or missing role, defaulting to 'user':", userRole);
                userRole = 'user';
            }

            // Log the role for debugging (dev only)
            if (import.meta.env.DEV) {
                console.log("Extracted user role:", userRole);
            }

            if (accessToken) {
                // Normalize the response to match our expected format
                const normalizedResponse: AuthSuccessResponse = {
                    success: true,
                    user: {
                        id: user.id || user.userId || user.uid,
                        email: user.email || normalizedEmail,
                        name: user.name || user.email?.split('@')[0],
                        role: (userRole as any) || 'user',
                        lastLogin: user.lastLogin || null
                    },
                    access_token: accessToken,
                    expires_at: typeof expiresAt === 'number' ? expiresAt : (Date.now() / 1000 + 3600)
                };
                return normalizedResponse;
            } else {
                // Log detailed information about what we received
                const debugInfo = {
                    hasUser: !!user,
                    userKeys: user ? Object.keys(user) : null,
                    dataKeys: Object.keys(data),
                    hasSession: !!data.session,
                    sessionKeys: data.session ? Object.keys(data.session) : null,
                    fullData: JSON.stringify(data, null, 2).substring(0, 500)
                };
                console.error("Response has user but missing access token:", debugInfo);

                // Check if maybe the Edge Function expects us to use Supabase client-side auth
                // In that case, we might need a different approach
                return {
                    success: false,
                    error: `Edge Function response missing access token. Available fields: ${Object.keys(data).join(', ')}. Please check the Edge Function returns a session with access_token.`
                };
            }
        }

        // If we get here, the response structure is unexpected
        console.error("Unexpected response structure - no user or success field:", data);
        return {
            success: false,
            error: `Invalid response format from server. Received: ${JSON.stringify(data).substring(0, 200)}`
        };
    } catch (error: any) {
        console.error("Login request failed", error);
        return {
            success: false,
            error: error.message || "Network request failed"
        };
    }
}
