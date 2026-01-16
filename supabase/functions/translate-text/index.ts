// Supabase Edge Function: translate-text
// Uses Google Translate API for automatic translation
// ONLY called from admin dashboard on create/update operations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers for Edge Function
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Supported languages
type Language = 'ar' | 'en' | 'fr';
const SUPPORTED_LANGUAGES: Language[] = ['ar', 'en', 'fr'];

// Translation result interface
interface TranslationResult {
    text: string;
    translations: {
        ar: string;
        en: string;
        fr: string;
    };
    sourceLanguage: Language;
    success: boolean;
    errors?: string[];
}

/**
 * Translate text using Google Translate API (unofficial)
 */
async function translateText(
    text: string,
    from: Language,
    to: Language
): Promise<string> {
    if (!text || text.trim() === '') return '';
    if (from === to) return text;

    try {
        // Using the Google Translate web API endpoint
        const url = new URL('https://translate.googleapis.com/translate_a/single');
        url.searchParams.set('client', 'gtx');
        url.searchParams.set('sl', from);
        url.searchParams.set('tl', to);
        url.searchParams.set('dt', 't');
        url.searchParams.set('q', text);

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            console.error(`Translation API error: ${response.status}`);
            return text; // Return original on failure
        }

        const data = await response.json();

        // Parse the response - format is [[["translated text","original text",null,null,10],...]]
        if (data && Array.isArray(data[0])) {
            const translatedParts = data[0]
                .filter((part: any) => Array.isArray(part) && part[0])
                .map((part: any) => part[0]);

            return translatedParts.join('');
        }

        return text;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Graceful fallback
    }
}

/**
 * Translate content to all supported languages
 */
async function translateToAllLanguages(
    text: string,
    sourceLanguage: Language
): Promise<TranslationResult> {
    const result: TranslationResult = {
        text,
        translations: {
            ar: sourceLanguage === 'ar' ? text : '',
            en: sourceLanguage === 'en' ? text : '',
            fr: sourceLanguage === 'fr' ? text : '',
        },
        sourceLanguage,
        success: true,
        errors: [],
    };

    // Translate to other languages
    const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage);

    for (const targetLang of targetLanguages) {
        try {
            const translated = await translateText(text, sourceLanguage, targetLang);
            result.translations[targetLang] = translated;
        } catch (error) {
            console.error(`Failed to translate to ${targetLang}:`, error);
            result.errors?.push(`Translation to ${targetLang} failed`);
            result.translations[targetLang] = text; // Fallback to original
        }
    }

    result.success = (result.errors?.length ?? 0) === 0;
    return result;
}

/**
 * Translate multiple fields at once
 */
async function translateMultipleFields(
    fields: Record<string, string>,
    sourceLanguage: Language
): Promise<Record<string, TranslationResult>> {
    const results: Record<string, TranslationResult> = {};

    // Process sequentially to avoid rate limiting
    for (const [key, value] of Object.entries(fields)) {
        if (value && value.trim()) {
            results[key] = await translateToAllLanguages(value, sourceLanguage);
            // Small delay between translations to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Check if the authorization header contains a valid JWT token (not just the anon key)
 */
function isValidJwtToken(authHeader: string, anonKey: string): boolean {
    if (!authHeader) return false;

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '').trim();

    // If the token is the same as the anon key, it's not a user token
    if (token === anonKey) {
        return false;
    }

    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    return true;
}

// Main Edge Function handler
serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

        // Verify authentication
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            console.error('[translate-text] Missing authorization header');
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check if the token is a valid JWT (not just the anon key)
        if (!isValidJwtToken(authHeader, supabaseAnonKey)) {
            console.error('[translate-text] Invalid token - appears to be anon key or malformed JWT');
            return new Response(
                JSON.stringify({
                    error: 'Invalid authentication token',
                    details: 'User session may have expired. Please log in again.'
                }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Verify the user is authenticated using Supabase
        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError) {
            console.error('[translate-text] Auth error:', authError.message);
            return new Response(
                JSON.stringify({
                    error: 'Authentication failed',
                    details: authError.message
                }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!user) {
            console.error('[translate-text] No user found for token');
            return new Response(
                JSON.stringify({ error: 'Unauthorized - no user found' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('[translate-text] Authenticated user:', user.id);

        // Parse request body
        const body = await req.json();
        const { text, fields, from, to } = body;

        // Validate source language
        const sourceLanguage: Language = SUPPORTED_LANGUAGES.includes(from) ? from : 'ar';

        // Handle single text translation
        if (text && typeof text === 'string') {
            if (to && SUPPORTED_LANGUAGES.includes(to)) {
                // Single language translation
                const translated = await translateText(text, sourceLanguage, to);
                return new Response(
                    JSON.stringify({ translatedText: translated, success: true }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            } else {
                // Translate to all languages
                const result = await translateToAllLanguages(text, sourceLanguage);
                return new Response(
                    JSON.stringify(result),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        // Handle multiple fields translation
        if (fields && typeof fields === 'object') {
            const results = await translateMultipleFields(fields, sourceLanguage);
            return new Response(
                JSON.stringify({ translations: results, success: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Invalid request: provide either "text" or "fields"' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[translate-text] Edge Function Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Translation service error',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
