import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth-storage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Creates a new Supabase client instance with the current access token injected.
 * 
 * ZERO-TRUST IMPLEMENTATION:
 * - We do not use Supabase Auth client-side persistence.
 * - We manually inject the Bearer token from our strict `sessionStorage`.
 * - This ensures every request uses the explicitly validated token.
 */
export const getAuthenticatedClient = () => {
    const session = getSession();
    const headers: Record<string, string> = {
        // Ensure apikey is always present
        apikey: supabaseKey,
        // Set Authorization header: use user token if available, otherwise use anon key
        Authorization: session?.access_token
            ? `Bearer ${session.access_token}`
            : `Bearer ${supabaseKey}`
    };

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        },
        global: {
            headers
        }
    });
};
