import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations } from './translations';
import {
    Language,
    MultilingualText,
    getLocalizedText,
    SUPPORTED_LANGUAGES,
    LANGUAGE_NAMES,
    DEFAULT_LANGUAGE
} from '@/types';

// ===========================================
// CONTEXT TYPES
// ===========================================

interface LanguageContextType {
    /** Current active language */
    language: Language;
    /** Set the active language */
    setLanguage: (lang: Language) => void;
    /** Translate static UI strings */
    t: (section: keyof typeof translations, key: string) => string;
    /** Translate nested UI strings */
    tNested: (section: keyof typeof translations, path: string) => string;
    /** Whether current language is RTL */
    isRTL: boolean;
    /** Text direction */
    dir: 'rtl' | 'ltr';

    // ======= NEW MULTILINGUAL CONTENT HELPERS =======

    /** Get localized content from MultilingualText */
    getContent: (translations: MultilingualText | undefined | null, fallback?: string) => string;
    /** Get localized content with custom fallback text */
    getContentWithFallback: (translations: MultilingualText | undefined | null, legacyText: string) => string;
    /** All supported languages */
    supportedLanguages: readonly Language[];
    /** Get language display name */
    getLanguageName: (lang: Language) => string;
}

// ===========================================
// CONTEXT
// ===========================================

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'appLanguage';

// ===========================================
// PROVIDER
// ===========================================

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

    // Load saved language on mount
    useEffect(() => {
        const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
        if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    // Update document direction and language when language changes
    useEffect(() => {
        const isRTL = language === 'ar';
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Update body classes for RTL/LTR specific styling
        document.body.classList.remove('rtl', 'ltr');
        document.body.classList.add(isRTL ? 'rtl' : 'ltr');

        // Add language-specific class for custom styling
        SUPPORTED_LANGUAGES.forEach(lang => {
            document.body.classList.remove(`lang-${lang}`);
        });
        document.body.classList.add(`lang-${language}`);
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        if (SUPPORTED_LANGUAGES.includes(lang)) {
            setLanguageState(lang);
            localStorage.setItem(STORAGE_KEY, lang);
        }
    }, []);

    // Static UI translation function
    const t = useCallback((section: keyof typeof translations, key: string): string => {
        const sectionData = translations[section];
        if (!sectionData) return key;

        const langData = (sectionData as Record<Language, Record<string, unknown>>)[language];
        if (!langData) return key;

        const value = langData[key];
        if (typeof value === 'string') return value;

        return key;
    }, [language]);

    // Nested translation function (e.g., 'categories.articles')
    const tNested = useCallback((section: keyof typeof translations, path: string): string => {
        const keys = path.split('.');
        const sectionData = translations[section];
        if (!sectionData) return path;

        const langData = (sectionData as Record<Language, Record<string, unknown>>)[language];
        if (!langData) return path;

        let value: unknown = langData;
        for (const key of keys) {
            if (typeof value === 'object' && value !== null && key in value) {
                value = (value as Record<string, unknown>)[key];
            } else {
                return path;
            }
        }

        return typeof value === 'string' ? value : path;
    }, [language]);

    /**
     * Get localized content from MultilingualText
     * Primary method for displaying database content
     * 
     * @example
     * const { getContent } = useLanguage();
     * return <h1>{getContent(article.title_translations)}</h1>;
     */
    const getContent = useCallback((
        multilingualText: MultilingualText | undefined | null,
        fallback: string = ''
    ): string => {
        return getLocalizedText(multilingualText, language, fallback);
    }, [language]);

    /**
     * Get localized content with legacy text fallback
     * Use during migration period when both old and new fields exist
     * 
     * @example
     * const { getContentWithFallback } = useLanguage();
     * // Uses translations if available, falls back to legacy field
     * return <h1>{getContentWithFallback(article.title_translations, article.title)}</h1>;
     */
    const getContentWithFallback = useCallback((
        multilingualText: MultilingualText | undefined | null,
        legacyText: string
    ): string => {
        const translated = getLocalizedText(multilingualText, language, '');
        return translated || legacyText || '';
    }, [language]);

    /**
     * Get display name for a language
     */
    const getLanguageName = useCallback((lang: Language): string => {
        return LANGUAGE_NAMES[lang] || lang;
    }, []);

    const isRTL = language === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            tNested,
            isRTL,
            dir,
            getContent,
            getContentWithFallback,
            supportedLanguages: SUPPORTED_LANGUAGES,
            getLanguageName,
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

// ===========================================
// HOOK
// ===========================================

/**
 * Hook to access language context and content helpers
 * 
 * @example
 * const { language, t, getContent } = useLanguage();
 * 
 * // For static UI text (from translations.ts)
 * <h1>{t('common', 'welcome')}</h1>
 * 
 * // For dynamic content (from database)
 * <h1>{getContent(announcement.title_translations)}</h1>
 */
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Export Language type for use in other files
export type { Language };
