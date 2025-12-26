export interface Article {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    category: string;
    author: string;
    date: string;
    image: string;
    featured?: boolean;
    // Translations
    title_en?: string;
    title_fr?: string;
    excerpt_en?: string;
    excerpt_fr?: string;
    content_en?: string;
    content_fr?: string;
}

export interface Announcement {
    id: number;
    title: string;
    date: string;
    urgent?: boolean;
    description?: string;
    // Translations
    title_en?: string;
    title_fr?: string;
}

export interface AdminUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: "super_admin" | "editor" | "administrator" | "user";
    avatar?: string;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

export interface CulturalFact {
    id: number;
    title: string;
    fact: string;
}
