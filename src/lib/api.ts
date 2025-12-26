
import { getAuthenticatedClient } from '@/lib/supabase';
import { Article, Announcement, AdminUser } from '@/data/mockData';
import { AbsentTeacher } from '@/components/AbsentTeachers';

// Articles API
export const api = {
    articles: {
        getAll: async () => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return data;
        },

        getById: async (id: number) => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        create: async (article: Omit<Article, 'id'>) => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('articles')
                .insert(article)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        update: async (id: number, article: Partial<Article>) => {
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

        delete: async (id: number) => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    announcements: {
        getAll: async () => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return data;
        },

        create: async (announcement: Omit<Announcement, 'id'>) => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('announcements')
                .insert(announcement)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        update: async (id: number, announcement: Partial<Announcement>) => {
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

        delete: async (id: number) => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    absentTeachers: {
        getAll: async () => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('absent_teachers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data?.map((t: any) => ({
                ...t,
                id: String(t.id),
                dateFrom: t.date_from,
                dateTo: t.date_to
            }));
        },

        create: async (teacher: Omit<AbsentTeacher, 'id'>) => {
            const supabase = getAuthenticatedClient();
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
                ...data,
                id: String(data.id),
                dateFrom: data.date_from,
                dateTo: data.date_to
            };
        },

        update: async (id: string, teacher: Partial<AbsentTeacher>) => {
            const supabase = getAuthenticatedClient();
            const updates: any = {};
            if (teacher.name) updates.name = teacher.name;
            if (teacher.subject) updates.subject = teacher.subject;
            if (teacher.dateFrom) updates.date_from = teacher.dateFrom;
            if (teacher.dateTo) updates.date_to = teacher.dateTo;
            if (teacher.duration) updates.duration = teacher.duration;
            if (teacher.note) updates.note = teacher.note;

            const { data, error } = await supabase
                .from('absent_teachers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return {
                ...data,
                id: String(data.id),
                dateFrom: data.date_from,
                dateTo: data.date_to
            };
        },

        delete: async (id: string) => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('absent_teachers')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }
    },

    culturalFacts: {
        getAll: async () => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('cultural_facts')
                .select('*');

            if (error) throw error;
            return data;
        }
    },

    users: {
        // Note: In a real app, you shouldn't return password hashes to the client
        // unless necessary for client-side legacy auth check (not recommended)
        getAll: async () => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('users')
                .select('*');

            if (error) throw error;
            return data;
        },

        getByUsername: async (username: string) => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) throw error;
            return data;
        }
    }
};
