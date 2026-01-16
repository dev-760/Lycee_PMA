import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth-storage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

// Cache for the authenticated client to prevent multiple GoTrueClient instances
let cachedClient: SupabaseClient | null = null;
let cachedToken: string | null = null;

/**
 * Creates or returns a cached Supabase client instance with the current access token injected.
 * 
 * ZERO-TRUST IMPLEMENTATION:
 * - We do not use Supabase Auth client-side persistence.
 * - We manually inject the Bearer token from our strict `sessionStorage`.
 * - This ensures every request uses the explicitly validated token.
 * - Client is cached to prevent "Multiple GoTrueClient instances" warnings.
 */
export const getAuthenticatedClient = (): SupabaseClient => {
    const session = getSession();
    const currentToken = session?.access_token || null;

    // Return cached client if token hasn't changed
    if (cachedClient && cachedToken === currentToken) {
        return cachedClient;
    }

    // Clear cache if token changed
    cachedToken = currentToken;

    const headers: Record<string, string> = {
        // Ensure apikey is always present
        apikey: supabaseKey,
        // Set Authorization header: use user token if available, otherwise use anon key
        Authorization: currentToken
            ? `Bearer ${currentToken}`
            : `Bearer ${supabaseKey}`
    };

    cachedClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        },
        global: {
            headers
        }
    });

    return cachedClient;
};

/**
 * Clears the cached Supabase client.
 * Call this on logout or when the session is invalidated.
 */
export const clearAuthenticatedClient = (): void => {
    cachedClient = null;
    cachedToken = null;
};

/**
 * Creates a fresh anonymous Supabase client without user authentication.
 * Use this for public operations that don't require user context.
 */
export const getAnonymousClient = (): SupabaseClient => {
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};
