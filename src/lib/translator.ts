import { Article, Announcement } from '@/lib/api';
import { getAuthenticatedClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth-storage';

// Types for translation directions
export type Language = 'ar' | 'en' | 'fr';

// Extend base types to support translation fields locally
interface TranslatableArticle extends Article {
    title_en?: string;
    title_fr?: string;
    excerpt_en?: string;
    excerpt_fr?: string;
    content_en?: string;
    content_fr?: string;
}

interface TranslatableAnnouncement extends Announcement {
    title_en?: string;
    title_fr?: string;
}

/**
 * Validated translation service using Edge Functions
 */
const translateText = async (text: string, from: Language, to: Language): Promise<string> => {
    if (!text) return '';
    if (from === to) return text;

    try {
        // 1. Validate Session locally
        const session = getSession();

        if (!session?.success) {
            console.warn("User must be logged in to use translation service");
            return `[AUTH_REQ] ${text}`; // Or handle gracefully
        }

        // 2. Call Edge Function
        const supabase = getAuthenticatedClient();
        const { data, error } = await supabase.functions.invoke('translate-text', {
            body: { text, from, to }
        });

        if (error) {
            console.error('Translation Function Error:', error);
            return text; // Fallback
        }

        return data.translatedText || text;

    } catch (err) {
        console.error('Translation Service Error:', err);
        return text;
    }
};

export const translateArticle = async (article: Article, sourceLang: Language = 'ar'): Promise<TranslatableArticle> => {
    const newArticle = { ...article } as TranslatableArticle;
    const targets: Language[] = ['ar', 'en', 'fr'].filter(l => l !== sourceLang) as Language[];

    for (const target of targets) {
        if (target !== 'ar') { // Only auto-fill secondary languages for now
            const translatedTitle = await translateText(article.title, sourceLang, target);
            if (target === 'en') newArticle.title_en = translatedTitle;
            else if (target === 'fr') newArticle.title_fr = translatedTitle;
        }

        // Translate Excerpt
        if (article.excerpt) {
            const translatedExcerpt = await translateText(article.excerpt, sourceLang, target);
            if (target === 'en') newArticle.excerpt_en = translatedExcerpt;
            else if (target === 'fr') newArticle.excerpt_fr = translatedExcerpt;
        }

        // Translate Content
        if (article.content) {
            const translatedContent = await translateText(article.content, sourceLang, target);
            if (target === 'en') newArticle.content_en = translatedContent;
            else if (target === 'fr') newArticle.content_fr = translatedContent;
        }
    }

    return newArticle;
};

export const translateAnnouncement = async (announcement: Announcement, sourceLang: Language = 'ar'): Promise<TranslatableAnnouncement> => {
    const newAnnouncement = { ...announcement } as TranslatableAnnouncement;
    const targets: Language[] = ['ar', 'en', 'fr'].filter(l => l !== sourceLang) as Language[];

    for (const target of targets) {
        const translatedTitle = await translateText(announcement.title, sourceLang, target);

        if (target === 'en') newAnnouncement.title_en = translatedTitle;
        else if (target === 'fr') newAnnouncement.title_fr = translatedTitle;
    }

    return newAnnouncement;
};

export const TranslationService = {
    translateArticle,
    translateAnnouncement,
    translateText
};
