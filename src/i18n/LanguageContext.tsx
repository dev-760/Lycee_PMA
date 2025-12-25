import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (section: keyof typeof translations, key: string) => string;
    tNested: (section: keyof typeof translations, path: string) => string;
    isRTL: boolean;
    dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'appLanguage';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('ar');

    // Load saved language on mount
    useEffect(() => {
        const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
        if (savedLang && ['ar', 'en', 'fr'].includes(savedLang)) {
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
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    // Translation function
    const t = (section: keyof typeof translations, key: string): string => {
        const sectionData = translations[section];
        if (!sectionData) return key;

        const langData = (sectionData as Record<Language, Record<string, unknown>>)[language];
        if (!langData) return key;

        const value = langData[key];
        if (typeof value === 'string') return value;

        return key;
    };

    // Nested translation function (e.g., 'categories.articles')
    const tNested = (section: keyof typeof translations, path: string): string => {
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
    };

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
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Export Language type for use in other files
export type { Language };
