
import { getAuthenticatedClient } from '@/lib/supabase';

// Define types locally since mockData is missing
export interface Article {
    id: number;
    title: string;
    excerpt?: string; // Added to match usage
    content?: string;
    summary?: string;
    image?: string;
    date: string;
    author?: string; // Added to match usage
    category?: string;
    is_published?: boolean;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
    is_active?: boolean;
}

export interface AdminUser {
    id: string;
    email: string;
    role?: string;
}

export interface CulturalFact {
    id: number;
    title: string;
    content: string;
}

export interface AbsentTeacher {
    id: number;
    name: string;
    subject: string;
    from: string;
    to: string;
    duration: string;
    note?: string;
}

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

        delete: async (id: number) => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('announcements')
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

    absentTeachers: {
        getAll: async () => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('absent_teachers')
                .select('*')
                .order('from', { ascending: false });

            // If table doesn't exist yet, return empty array to prevent crash
            if (error && error.code === '42P01') {
                console.warn('absent_teachers table does not exist');
                return [];
            }
            if (error) throw error;
            return data as AbsentTeacher[];
        },

        create: async (teacher: Omit<AbsentTeacher, 'id'>) => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('absent_teachers')
                .insert(teacher)
                .select()
                .single();

            if (error) throw error;
            return data as AbsentTeacher;
        },

        update: async (id: number, teacher: Partial<AbsentTeacher>) => {
            const supabase = getAuthenticatedClient();
            const { data, error } = await supabase
                .from('absent_teachers')
                .update(teacher)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as AbsentTeacher;
        },

        delete: async (id: number) => {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase
                .from('absent_teachers')
                .delete()
                .eq('id', id);

            if (error) throw error;
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
