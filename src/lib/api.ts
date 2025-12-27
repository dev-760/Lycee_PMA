/**
 * API Client with Multilingual Support
 * 
 * All content operations now handle multilingual translations.
 * Translations are generated server-side on create/update.
 */

import { getAuthenticatedClient } from './supabase';
import {
    Article,
    Announcement,
    AdminUser,
    CulturalFact,
    AbsentTeacher,
    Language,
    createEmptyMultilingualText,
} from '@/types';
import {
    prepareAnnouncementWithTranslations,
    prepareArticleWithTranslations,
    prepareAbsentTeacherWithTranslations,
} from './translator';

// ===========================================
// DATABASE FIELD MAPPING
// ===========================================

/**
 * Parse JSONB translations from database
 * Handles both object and string formats
 */
function parseTranslations(data: unknown): { ar: string; en: string; fr: string } {
    if (!data) return createEmptyMultilingualText();

    // Already an object
    if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        return {
            ar: String(obj.ar || ''),
            en: String(obj.en || ''),
            fr: String(obj.fr || ''),
        };
    }

    // JSON string
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return {
                ar: String(parsed.ar || ''),
                en: String(parsed.en || ''),
                fr: String(parsed.fr || ''),
            };
        } catch {
            return createEmptyMultilingualText();
        }
    }

    return createEmptyMultilingualText();
}

/**
 * Parse array fields from database (handles JSONB arrays)
 */
function parseArrayField(data: unknown): string[] {
    if (!data) return [];
    if (Array.isArray(data)) return data.map(String);
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * Map database row to Article type
 */
function mapArticle(row: any): Article {
    const legacyImage = row.image || '';
    const images = parseArrayField(row.images);

    // If no images array but we have legacy image, use it as first image
    const finalImages = images.length > 0 ? images : (legacyImage ? [legacyImage] : []);

    return {
        id: row.id,
        title: row.title || '',
        excerpt: row.excerpt || '',
        content: row.content || '',
        title_translations: parseTranslations(row.title_translations),
        excerpt_translations: parseTranslations(row.excerpt_translations),
        content_translations: parseTranslations(row.content_translations),
        category: row.category || '',
        author: row.author || '',
        date: row.date || '',
        image: legacyImage, // Keep for backward compatibility
        images: finalImages, // New multi-image support
        videos: parseArrayField(row.videos), // New video support
        featured: row.featured || false,
        source_language: (row.source_language as Language) || 'ar',
        created_at: row.created_at,
    };
}

/**
 * Map database row to Announcement type
 */
function mapAnnouncement(row: any): Announcement {
    return {
        id: row.id,
        title: row.title || '',
        description: row.description || '',
        title_translations: parseTranslations(row.title_translations),
        description_translations: parseTranslations(row.description_translations),
        date: row.date || '',
        urgent: row.urgent || false,
        link_url: row.link_url || '',
        link_text: row.link_text || '',
        source_language: (row.source_language as Language) || 'ar',
        created_at: row.created_at,
    };
}

/**
 * Map database row to AbsentTeacher type
 */
function mapAbsentTeacher(row: any): AbsentTeacher {
    return {
        id: String(row.id),
        name: row.name || '',
        subject: row.subject || '',
        note: row.note || '',
        name_translations: parseTranslations(row.name_translations),
        subject_translations: parseTranslations(row.subject_translations),
        note_translations: parseTranslations(row.note_translations),
        dateFrom: row.date_from || '',
        dateTo: row.date_to || '',
        duration: row.duration || '',
        source_language: (row.source_language as Language) || 'ar',
        created_at: row.created_at,
    };
}

/**
 * Map database row to CulturalFact type
 */
function mapCulturalFact(row: any): CulturalFact {
    return {
        id: row.id,
        title: row.title || '',
        fact: row.fact || '',
        title_translations: parseTranslations(row.title_translations),
        fact_translations: parseTranslations(row.fact_translations),
        source_language: (row.source_language as Language) || 'ar',
        created_at: row.created_at,
    };
}

// ===========================================
// API CLIENT
// ===========================================

export const api = {
    // =========================================
    // ARTICLES
    // =========================================
    articles: {
        getAll: async (): Promise<Article[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapArticle);
        },

        getById: async (id: number): Promise<Article | null> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data ? mapArticle(data) : null;
        },

        /**
         * Create article with automatic translation
         * @param article - Article data
         * @param sourceLanguage - Language the content is written in
         */
        create: async (
            article: {
                title: string;
                excerpt: string;
                content?: string;
                category: string;
                author: string;
                image?: string;
                images?: string[];
                videos?: string[];
                featured?: boolean;
                date?: string;
            },
            sourceLanguage: Language = 'ar'
        ): Promise<Article> => {
            const supabase = getAuthenticatedClient();

            // Prepare data with translations
            const preparedData = await prepareArticleWithTranslations(article, sourceLanguage);

            // Handle images - use images array if provided, otherwise use single image
            const images = article.images?.slice(0, 10) || (article.image ? [article.image] : []);
            const videos = article.videos?.slice(0, 5) || [];

            const { data, error } = await supabase
                .from('articles')
                .insert({
                    ...preparedData,
                    image: images[0] || '', // Legacy field - first image
                    images: images, // New multi-image field
                    videos: videos, // New video field
                    date: article.date || new Date().toISOString().split('T')[0],
                })
                .select()
                .single();

            if (error) throw error;
            return mapArticle(data);
        },

        /**
         * Update article with automatic re-translation
         * @param id - Article ID
         * @param article - Updated fields
         * @param sourceLanguage - Language the content is written in
         * @param retranslate - Whether to regenerate translations
         */
        update: async (
            id: number,
            article: Partial<{
                title: string;
                excerpt: string;
                content: string;
                category: string;
                author: string;
                image: string;
                images: string[];
                videos: string[];
                featured: boolean;
            }>,
            sourceLanguage: Language = 'ar',
            retranslate: boolean = true
        ): Promise<Article> => {
            const supabase = getAuthenticatedClient();

            let updateData: any = { ...article };

            // Handle images and videos
            if (article.images !== undefined) {
                updateData.images = article.images.slice(0, 10);
                updateData.image = article.images[0] || ''; // Keep legacy field in sync
            }
            if (article.videos !== undefined) {
                updateData.videos = article.videos.slice(0, 5);
            }

            // Retranslate if content fields changed
            if (retranslate && (article.title || article.excerpt || article.content)) {
                // Get current article for fields that aren't being updated
                const { data: current } = await supabase
                    .from('articles')
                    .select('title, excerpt, content')
                    .eq('id', id)
                    .single();

                const fullData = {
                    title: article.title ?? current?.title ?? '',
                    excerpt: article.excerpt ?? current?.excerpt ?? '',
                    content: article.content ?? current?.content ?? '',
                    category: article.category ?? '',
                    author: article.author ?? '',
                    image: article.image,
                    featured: article.featured,
                };

                const preparedData = await prepareArticleWithTranslations(fullData, sourceLanguage);
                updateData = { ...updateData, ...preparedData };
            }

            const { data, error } = await supabase
                .from('articles')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapArticle(data);
        },

        delete: async (id: number): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
    },

    // =========================================
    // ANNOUNCEMENTS
    // =========================================
    announcements: {
        getAll: async (): Promise<Announcement[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapAnnouncement);
        },

        /**
         * Create announcement with automatic translation
         */
        create: async (
            announcement: {
                title: string;
                description?: string;
                urgent?: boolean;
                link_url?: string;
                link_text?: string;
                date?: string;
            },
            sourceLanguage: Language = 'ar'
        ): Promise<Announcement> => {
            const supabase = getAuthenticatedClient();

            // Prepare data with translations
            const preparedData = await prepareAnnouncementWithTranslations(announcement, sourceLanguage);

            const { data, error } = await supabase
                .from('announcements')
                .insert({
                    ...preparedData,
                    date: announcement.date || new Date().toISOString().split('T')[0],
                })
                .select()
                .single();

            if (error) throw error;
            return mapAnnouncement(data);
        },

        /**
         * Update announcement with automatic re-translation
         */
        update: async (
            id: number,
            announcement: Partial<{
                title: string;
                description: string;
                urgent: boolean;
                link_url: string;
                link_text: string;
            }>,
            sourceLanguage: Language = 'ar',
            retranslate: boolean = true
        ): Promise<Announcement> => {
            const supabase = getAuthenticatedClient();

            let updateData: any = { ...announcement };

            // Retranslate if text fields changed
            if (retranslate && (announcement.title || announcement.description)) {
                const { data: current } = await supabase
                    .from('announcements')
                    .select('title, description')
                    .eq('id', id)
                    .single();

                const fullData = {
                    title: announcement.title ?? current?.title ?? '',
                    description: announcement.description ?? current?.description ?? '',
                    urgent: announcement.urgent,
                    link_url: announcement.link_url,
                    link_text: announcement.link_text,
                };

                const preparedData = await prepareAnnouncementWithTranslations(fullData, sourceLanguage);
                updateData = { ...updateData, ...preparedData };
            }

            const { data, error } = await supabase
                .from('announcements')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapAnnouncement(data);
        },

        delete: async (id: number): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
    },

    // =========================================
    // ABSENT TEACHERS
    // =========================================
    absentTeachers: {
        getAll: async (): Promise<AbsentTeacher[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('absent_teachers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(mapAbsentTeacher);
        },

        /**
         * Create absent teacher with automatic translation
         */
        create: async (
            teacher: {
                name: string;
                subject?: string;
                note?: string;
                dateFrom: string;
                dateTo: string;
                duration?: string;
            },
            sourceLanguage: Language = 'ar'
        ): Promise<AbsentTeacher> => {
            const supabase = getAuthenticatedClient();

            const preparedData = await prepareAbsentTeacherWithTranslations(teacher, sourceLanguage);

            const { data, error } = await supabase
                .from('absent_teachers')
                .insert(preparedData)
                .select()
                .single();

            if (error) throw error;
            return mapAbsentTeacher(data);
        },

        /**
         * Update absent teacher with automatic re-translation
         */
        update: async (
            id: string,
            teacher: Partial<{
                name: string;
                subject: string;
                note: string;
                dateFrom: string;
                dateTo: string;
                duration: string;
            }>,
            sourceLanguage: Language = 'ar',
            retranslate: boolean = true
        ): Promise<AbsentTeacher> => {
            const supabase = getAuthenticatedClient();

            // Map to database columns
            const updates: any = {};
            if (teacher.dateFrom !== undefined) updates.date_from = teacher.dateFrom;
            if (teacher.dateTo !== undefined) updates.date_to = teacher.dateTo;
            if (teacher.duration !== undefined) updates.duration = teacher.duration;

            // Retranslate if text fields changed
            if (retranslate && (teacher.name || teacher.subject || teacher.note)) {
                const { data: current } = await supabase
                    .from('absent_teachers')
                    .select('name, subject, note, date_from, date_to, duration')
                    .eq('id', id)
                    .single();

                const fullData = {
                    name: teacher.name ?? current?.name ?? '',
                    subject: teacher.subject ?? current?.subject ?? '',
                    note: teacher.note ?? current?.note ?? '',
                    dateFrom: teacher.dateFrom ?? current?.date_from ?? '',
                    dateTo: teacher.dateTo ?? current?.date_to ?? '',
                    duration: teacher.duration ?? current?.duration ?? '',
                };

                const preparedData = await prepareAbsentTeacherWithTranslations(fullData, sourceLanguage);
                Object.assign(updates, preparedData);
            } else {
                if (teacher.name !== undefined) updates.name = teacher.name;
                if (teacher.subject !== undefined) updates.subject = teacher.subject;
                if (teacher.note !== undefined) updates.note = teacher.note;
            }

            const { data, error } = await supabase
                .from('absent_teachers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return mapAbsentTeacher(data);
        },

        delete: async (id: string): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('absent_teachers')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
    },

    // =========================================
    // CULTURAL FACTS
    // =========================================
    culturalFacts: {
        getAll: async (): Promise<CulturalFact[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('cultural_facts')
                .select('*');

            if (error) throw error;
            return (data || []).map(mapCulturalFact);
        },
    },

    // =========================================
    // USERS (No translation needed)
    // =========================================
    users: {
        getAll: async (): Promise<any[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('users')
                .select('*');

            if (error) throw error;
            return data || [];
        },

        getByUsername: async (username: string): Promise<any | null> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) throw error;
            return data;
        },

        update: async (id: string, updates: Partial<AdminUser>): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('users')
                .update({
                    name: updates.name,
                    username: updates.username,
                    role: updates.role,
                    is_active: updates.isActive,
                })
                .eq('id', id);

            if (error) throw error;
        },

        delete: async (id: string): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
    },
};

// Re-export types for convenience
export type { Article, Announcement, AbsentTeacher, CulturalFact, AdminUser };
