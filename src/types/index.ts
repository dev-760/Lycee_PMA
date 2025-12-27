/**
 * Multilingual Types for School Website
 * 
 * All translatable content uses the MultilingualText structure
 * which stores translations for all supported languages.
 */

// ===========================================
// CORE TYPES
// ===========================================

/** Supported languages */
export type Language = 'ar' | 'en' | 'fr';

/** Default language */
export const DEFAULT_LANGUAGE: Language = 'ar';

/** All supported languages */
export const SUPPORTED_LANGUAGES: readonly Language[] = ['ar', 'en', 'fr'] as const;

/** Language display names */
export const LANGUAGE_NAMES: Record<Language, string> = {
    ar: 'العربية',
    en: 'English',
    fr: 'Français',
};

/** Multilingual text field structure */
export interface MultilingualText {
    ar: string;
    en: string;
    fr: string;
}

/** Create empty multilingual text */
export function createEmptyMultilingualText(): MultilingualText {
    return { ar: '', en: '', fr: '' };
}

/** Create multilingual text with initial value */
export function createMultilingualText(
    text: string,
    language: Language = DEFAULT_LANGUAGE
): MultilingualText {
    const result = createEmptyMultilingualText();
    result[language] = text;
    return result;
}

// ===========================================
// ARTICLE TYPES
// ===========================================

/** Media item for images and videos */
export interface MediaItem {
    url: string;
    type: 'image' | 'video';
    thumbnail?: string; // For videos, optional thumbnail
}

export interface Article {
    id: number;
    // Legacy fields (for backward compatibility during migration)
    title: string;
    excerpt: string;
    content?: string;
    // Multilingual fields
    title_translations: MultilingualText;
    excerpt_translations: MultilingualText;
    content_translations: MultilingualText;
    // Non-translatable fields
    category: string;
    author: string;
    date: string;
    // Media fields
    image: string; // Legacy single image (kept for backward compatibility)
    images: string[]; // Up to 10 images
    videos: string[]; // Video URLs
    featured?: boolean;
    source_language: Language;
    created_at?: string;
}

/** Input for creating/updating articles */
export interface ArticleInput {
    title: string;
    excerpt: string;
    content?: string;
    category: string;
    author: string;
    image?: string; // Legacy single image
    images?: string[]; // Up to 10 images
    videos?: string[]; // Video URLs
    featured?: boolean;
    source_language?: Language;
}

// ===========================================
// ANNOUNCEMENT TYPES
// ===========================================

export interface Announcement {
    id: number;
    // Legacy fields
    title: string;
    description?: string;
    // Multilingual fields
    title_translations: MultilingualText;
    description_translations: MultilingualText;
    // Non-translatable fields
    date: string;
    urgent?: boolean;
    link_url?: string;
    link_text?: string;
    source_language: Language;
    created_at?: string;
}

/** Input for creating/updating announcements */
export interface AnnouncementInput {
    title: string;
    description?: string;
    urgent?: boolean;
    link_url?: string;
    link_text?: string;
    source_language?: Language;
}

// ===========================================
// ABSENT TEACHER TYPES
// ===========================================

export interface AbsentTeacher {
    id: string;
    // Legacy fields
    name: string;
    subject?: string;
    note?: string;
    // Multilingual fields
    name_translations: MultilingualText;
    subject_translations: MultilingualText;
    note_translations: MultilingualText;
    // Non-translatable fields
    dateFrom: string;
    dateTo: string;
    duration?: string;
    source_language: Language;
    created_at?: string;
}

/** Input for creating/updating absent teachers */
export interface AbsentTeacherInput {
    name: string;
    subject?: string;
    note?: string;
    dateFrom: string;
    dateTo: string;
    duration?: string;
    source_language?: Language;
}

// ===========================================
// CULTURAL FACT TYPES
// ===========================================

export interface CulturalFact {
    id: number;
    // Legacy fields
    title: string;
    fact: string;
    // Multilingual fields
    title_translations: MultilingualText;
    fact_translations: MultilingualText;
    source_language: Language;
    created_at?: string;
}

// ===========================================
// ADMIN USER TYPES (Non-translatable)
// ===========================================

export interface AdminUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: 'super_admin' | 'editor' | 'administrator' | 'user';
    avatar?: string;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

// ===========================================
// TRANSLATION SERVICE TYPES
// ===========================================

/** Translation request for single text */
export interface TranslateTextRequest {
    text: string;
    from: Language;
    to?: Language; // If not provided, translates to all languages
}

/** Translation request for multiple fields */
export interface TranslateFieldsRequest {
    fields: Record<string, string>;
    from: Language;
}

/** Translation result */
export interface TranslationResult {
    text: string;
    translations: MultilingualText;
    sourceLanguage: Language;
    success: boolean;
    errors?: string[];
}

/** Batch translation result */
export interface BatchTranslationResult {
    translations: Record<string, TranslationResult>;
    success: boolean;
}

// ===========================================
// UTILITY TYPES
// ===========================================

/** Get text for current language with fallback */
export function getLocalizedText(
    translations: MultilingualText | undefined | null,
    language: Language,
    fallback: string = ''
): string {
    if (!translations) return fallback;

    // Try requested language
    if (translations[language] && translations[language].trim()) {
        return translations[language];
    }

    // Fallback chain: ar -> en -> fr -> fallback
    if (translations.ar && translations.ar.trim()) return translations.ar;
    if (translations.en && translations.en.trim()) return translations.en;
    if (translations.fr && translations.fr.trim()) return translations.fr;

    return fallback;
}

/** Check if translations exist for a language */
export function hasTranslation(
    translations: MultilingualText | undefined | null,
    language: Language
): boolean {
    return !!(translations?.[language] && translations[language].trim());
}

/** Get translation completeness percentage */
export function getTranslationCompleteness(translations: MultilingualText): number {
    const filled = SUPPORTED_LANGUAGES.filter(
        lang => translations[lang] && translations[lang].trim()
    ).length;
    return Math.round((filled / SUPPORTED_LANGUAGES.length) * 100);
}
