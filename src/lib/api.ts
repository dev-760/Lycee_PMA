import { getAuthenticatedClient } from './supabase';
import { Article, Announcement, AdminUser, CulturalFact } from '@/types';
import { AbsentTeacher } from '@/components/AbsentTeachers';

// API client for Supabase operations
export const api = {
    articles: {
        getAll: async (): Promise<Article[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        },

        getById: async (id: number): Promise<Article | null> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        create: async (article: Omit<Article, 'id'>): Promise<Article> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .insert(article)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        update: async (id: number, article: Partial<Article>): Promise<Article> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .update(article)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        delete: async (id: number): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    announcements: {
        getAll: async (): Promise<Announcement[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        },

        create: async (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('announcements')
                .insert(announcement)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        update: async (id: number, announcement: Partial<Announcement>): Promise<Announcement> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('announcements')
                .update(announcement)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        delete: async (id: number): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    absentTeachers: {
        getAll: async (): Promise<AbsentTeacher[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('absent_teachers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database columns to component interface
            return (data || []).map((t: any) => ({
                id: String(t.id),
                name: t.name,
                subject: t.subject,
                dateFrom: t.date_from,
                dateTo: t.date_to,
                duration: t.duration,
                note: t.note
            }));
        },

        create: async (teacher: Omit<AbsentTeacher, 'id'>): Promise<AbsentTeacher> => {
            const supabase = getAuthenticatedClient();

            // Map component interface to database columns
            const dbTeacher = {
                name: teacher.name,
                subject: teacher.subject,
                date_from: teacher.dateFrom,
                date_to: teacher.dateTo,
                duration: teacher.duration,
                note: teacher.note
            };

            const { data, error } = await supabase
                .from('absent_teachers')
                .insert(dbTeacher)
                .select()
                .single();

            if (error) throw error;

            return {
                id: String(data.id),
                name: data.name,
                subject: data.subject,
                dateFrom: data.date_from,
                dateTo: data.date_to,
                duration: data.duration,
                note: data.note
            };
        },

        update: async (id: string, teacher: Partial<AbsentTeacher>): Promise<AbsentTeacher> => {
            const supabase = getAuthenticatedClient();

            // Map component interface to database columns
            const updates: any = {};
            if (teacher.name !== undefined) updates.name = teacher.name;
            if (teacher.subject !== undefined) updates.subject = teacher.subject;
            if (teacher.dateFrom !== undefined) updates.date_from = teacher.dateFrom;
            if (teacher.dateTo !== undefined) updates.date_to = teacher.dateTo;
            if (teacher.duration !== undefined) updates.duration = teacher.duration;
            if (teacher.note !== undefined) updates.note = teacher.note;

            const { data, error } = await supabase
                .from('absent_teachers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return {
                id: String(data.id),
                name: data.name,
                subject: data.subject,
                dateFrom: data.date_from,
                dateTo: data.date_to,
                duration: data.duration,
                note: data.note
            };
        },

        delete: async (id: string): Promise<void> => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('absent_teachers')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    culturalFacts: {
        getAll: async (): Promise<CulturalFact[]> => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('cultural_facts')
                .select('*');

            if (error) throw error;
            return data || [];
        }
    },

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
                    is_active: updates.isActive
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
        }
    }
};
