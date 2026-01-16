/**
 * Translation Service
 * 
 * Reusable helper for translating content via Edge Functions.
 * This service is called ONLY during create/update operations.
 * 
 * @example
 * // Single text translation
 * const translations = await translateText('Hello', 'en');
 * // Result: { ar: '...', en: 'Hello', fr: '...' }
 * 
 * @example
 * // Multiple fields translation
 * const results = await translateFields({ title: 'Hello', content: 'World' }, 'en');
 */

import { getAuthenticatedClient } from './supabase';
import { getSession } from './auth-storage';
import {
    Language,
    MultilingualText,
    TranslationResult,
    BatchTranslationResult,
    createEmptyMultilingualText,
    SUPPORTED_LANGUAGES,
} from '@/types';

// ===========================================
// CONFIGURATION
// ===========================================

/** Maximum retries for translation */
const MAX_RETRIES = 2;

/** Delay between retries (ms) */
const RETRY_DELAY = 1000;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Delay execution
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate that user is authenticated with a valid token
 */
function validateAuth(): boolean {
    const session = getSession();
    // Check both session success and presence of access_token
    return session?.success === true && !!session?.access_token;
}

// ===========================================
// CORE TRANSLATION FUNCTIONS
// ===========================================

/**
 * Translate a single text to all supported languages
 * 
 * @param text - Text to translate
 * @param sourceLanguage - Source language of the text
 * @returns MultilingualText with translations for all languages
 * 
 * @example
 * const result = await translateText('مرحبا', 'ar');
 * console.log(result);
 * // { ar: 'مرحبا', en: 'Hello', fr: 'Bonjour' }
 */
export async function translateText(
    text: string,
    sourceLanguage: Language = 'ar'
): Promise<MultilingualText> {
    // Return empty if no text
    if (!text || !text.trim()) {
        return createEmptyMultilingualText();
    }

    // Validate authentication
    if (!validateAuth()) {
        console.warn('[Translation] User not authenticated, returning source only');
        const result = createEmptyMultilingualText();
        result[sourceLanguage] = text;
        return result;
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const supabase = getAuthenticatedClient();

            const { data, error } = await supabase.functions.invoke('translate-text', {
                body: {
                    text,
                    from: sourceLanguage,
                },
            });

            if (error) {
                throw new Error(error.message || 'Translation function error');
            }

            if (data?.translations) {
                return data.translations as MultilingualText;
            }

            // Fallback: return source text only
            const fallback = createEmptyMultilingualText();
            fallback[sourceLanguage] = text;
            return fallback;

        } catch (err) {
            lastError = err instanceof Error ? err : new Error('Unknown error');
            console.warn(`[Translation] Attempt ${attempt + 1} failed:`, lastError.message);

            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY);
            }
        }
    }

    // All retries failed, return source only
    console.error('[Translation] All retries failed:', lastError?.message);
    const fallback = createEmptyMultilingualText();
    fallback[sourceLanguage] = text;
    return fallback;
}

/**
 * Translate multiple fields at once
 * More efficient than calling translateText multiple times
 * 
 * @param fields - Object with field names as keys and text as values
 * @param sourceLanguage - Source language of all texts
 * @returns Object with same keys, values are MultilingualText
 * 
 * @example
 * const result = await translateFields({
 *   title: 'إعلان هام',
 *   description: 'محتوى الإعلان'
 * }, 'ar');
 * 
 * console.log(result.title);
 * // { ar: 'إعلان هام', en: 'Important announcement', fr: 'Annonce importante' }
 */
export async function translateFields(
    fields: Record<string, string>,
    sourceLanguage: Language = 'ar'
): Promise<Record<string, MultilingualText>> {
    const result: Record<string, MultilingualText> = {};

    // Initialize all fields with source text
    for (const [key, value] of Object.entries(fields)) {
        const translations = createEmptyMultilingualText();
        if (value && value.trim()) {
            translations[sourceLanguage] = value;
        }
        result[key] = translations;
    }

    // Filter out empty fields
    const nonEmptyFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
        if (value && value.trim()) {
            nonEmptyFields[key] = value;
        }
    }

    // If all fields are empty, return immediately
    if (Object.keys(nonEmptyFields).length === 0) {
        return result;
    }

    // Validate authentication
    if (!validateAuth()) {
        console.warn('[Translation] User not authenticated, returning source only');
        return result;
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const supabase = getAuthenticatedClient();

            const { data, error } = await supabase.functions.invoke('translate-text', {
                body: {
                    fields: nonEmptyFields,
                    from: sourceLanguage,
                },
            });

            if (error) {
                throw new Error(error.message || 'Translation function error');
            }

            if (data?.translations) {
                // Merge translations into result
                for (const [key, translation] of Object.entries(data.translations)) {
                    if ((translation as TranslationResult)?.translations) {
                        result[key] = (translation as TranslationResult).translations;
                    }
                }
            }

            return result;

        } catch (err) {
            lastError = err instanceof Error ? err : new Error('Unknown error');
            console.warn(`[Translation] Batch attempt ${attempt + 1} failed:`, lastError.message);

            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY);
            }
        }
    }

    // All retries failed, return source only
    console.error('[Translation] All batch retries failed:', lastError?.message);
    return result;
}

/**
 * Translate to a specific target language only
 * Use this for targeted single-language translation
 * 
 * @param text - Text to translate
 * @param from - Source language
 * @param to - Target language
 * @returns Translated text string
 */
export async function translateToLanguage(
    text: string,
    from: Language,
    to: Language
): Promise<string> {
    if (!text || !text.trim()) return '';
    if (from === to) return text;

    if (!validateAuth()) {
        console.warn('[Translation] User not authenticated');
        return text;
    }

    try {
        const supabase = getAuthenticatedClient();

        const { data, error } = await supabase.functions.invoke('translate-text', {
            body: { text, from, to },
        });

        if (error) {
            console.error('[Translation] Error:', error.message);
            return text;
        }

        return data?.translatedText || text;

    } catch (err) {
        console.error('[Translation] Network error:', err);
        return text;
    }
}

// ===========================================
// CONTENT HELPERS
// ===========================================

/**
 * Prepare announcement data with translations
 */
export async function prepareAnnouncementWithTranslations(
    data: {
        title: string;
        description?: string;
        urgent?: boolean;
        link_url?: string;
        link_text?: string;
    },
    sourceLanguage: Language = 'ar'
) {
    const fieldsToTranslate: Record<string, string> = {
        title: data.title,
    };

    if (data.description) {
        fieldsToTranslate.description = data.description;
    }

    const translations = await translateFields(fieldsToTranslate, sourceLanguage);

    return {
        title: data.title,
        description: data.description || null,
        title_translations: translations.title,
        description_translations: translations.description || createEmptyMultilingualText(),
        urgent: data.urgent || false,
        link_url: data.link_url || null,
        link_text: data.link_text || null,
        source_language: sourceLanguage,
    };
}

/**
 * Prepare article data with translations
 */
export async function prepareArticleWithTranslations(
    data: {
        title: string;
        excerpt: string;
        content?: string;
        category: string;
        author: string;
        image?: string;
        featured?: boolean;
    },
    sourceLanguage: Language = 'ar'
) {
    const fieldsToTranslate: Record<string, string> = {
        title: data.title,
        excerpt: data.excerpt,
    };

    if (data.content) {
        fieldsToTranslate.content = data.content;
    }

    const translations = await translateFields(fieldsToTranslate, sourceLanguage);

    return {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content || null,
        title_translations: translations.title,
        excerpt_translations: translations.excerpt,
        content_translations: translations.content || createEmptyMultilingualText(),
        category: data.category,
        author: data.author,
        image: data.image || null,
        featured: data.featured || false,
        source_language: sourceLanguage,
    };
}

/**
 * Prepare absent teacher data with translations
 */
export async function prepareAbsentTeacherWithTranslations(
    data: {
        name: string;
        subject?: string;
        note?: string;
        dateFrom: string;
        dateTo: string;
        duration?: string;
    },
    sourceLanguage: Language = 'ar'
) {
    const fieldsToTranslate: Record<string, string> = {
        name: data.name,
    };

    if (data.subject) {
        fieldsToTranslate.subject = data.subject;
    }

    if (data.note) {
        fieldsToTranslate.note = data.note;
    }

    const translations = await translateFields(fieldsToTranslate, sourceLanguage);

    return {
        name: data.name,
        subject: data.subject || null,
        note: data.note || null,
        name_translations: translations.name,
        subject_translations: translations.subject || createEmptyMultilingualText(),
        note_translations: translations.note || createEmptyMultilingualText(),
        date_from: data.dateFrom,
        date_to: data.dateTo,
        duration: data.duration || null,
        source_language: sourceLanguage,
    };
}

// ===========================================
// EXPORTS
// ===========================================

export const TranslationService = {
    translateText,
    translateFields,
    translateToLanguage,
    prepareAnnouncementWithTranslations,
    prepareArticleWithTranslations,
    prepareAbsentTeacherWithTranslations,
};

export default TranslationService;
