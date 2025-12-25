
import { getAuthenticatedClient } from '@/lib/supabase';
import { Article, Announcement, AdminUser } from '@/data/mockData';

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
