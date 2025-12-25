
import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { getAuthenticatedClient } from '@/lib/supabase';
import {
    validatePassword,
    PasswordStrength
} from '@/admin/utils/security';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { UserRole as AuthUserRole } from '@/api/auth.types';

// User roles (aligned with AuthContext)
export type UserRole = AuthUserRole;

// User interface
export interface AdminUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

// Role permissions
export interface RolePermissions {
    canViewDashboard: boolean;
    canManageArticles: boolean;
    canManageNews: boolean;
    canManageAnnouncements: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canDelete: boolean;
    canCreate: boolean;
    canEdit: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
    super_admin: {
        canViewDashboard: true,
        canManageArticles: true,
        canManageNews: true,
        canManageAnnouncements: true,
        canManageUsers: true,
        canManageSettings: true,
        canDelete: true,
        canCreate: true,
        canEdit: true,
    },
    editor: {
        canViewDashboard: true,
        canManageArticles: true,
        canManageNews: true,
        canManageAnnouncements: false,
        canManageUsers: false,
        canManageSettings: false,
        canDelete: true,
        canCreate: true,
        canEdit: true,
    },
    administrator: {
        canViewDashboard: true,
        canManageArticles: false,
        canManageNews: false,
        canManageAnnouncements: true,
        canManageUsers: false,
        canManageSettings: false,
        canDelete: true,
        canCreate: true,
        canEdit: true,
    },
    user: {
        canViewDashboard: false,
        canManageArticles: false,
        canManageNews: false,
        canManageAnnouncements: false,
        canManageUsers: false,
        canManageSettings: false,
        canDelete: false,
        canCreate: false,
        canEdit: false,
    }
};

export const roleDisplayNames: Record<UserRole, string> = {
    super_admin: 'مدير عام',
    editor: 'محرر',
    administrator: 'مسؤول الإعلانات',
    user: 'مستخدم'
};

const defaultUsers: AdminUser[] = [];

interface LoginResult {
    success: boolean;
    error?: string;
}

interface AdminContextType {
    isAuthenticated: boolean;
    currentUser: AdminUser | null;
    users: AdminUser[];
    permissions: RolePermissions | null;
    sessionExpired: boolean;
    login: (username: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    addUser: (user: Omit<AdminUser, 'id' | 'createdAt'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
    updateUser: (id: string, updates: Partial<AdminUser> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
    hasPermission: (permission: keyof RolePermissions) => boolean;
    validateUserPassword: (password: string) => PasswordStrength;
    refreshSession: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    // Integration with Global AuthContext
    const { user: authUser, login: authLogin, logout: authLogout } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);

    // Derive currentUser from authUser
    // useMemo ensures stable reference to prevent unnecessary context updates
    const currentUser = useMemo<AdminUser | null>(() => {
        if (!authUser) return null;
        return {
            id: authUser.id,
            username: authUser.email.split('@')[0],
            name: authUser.email.split('@')[0], // Fallback if name not available
            email: authUser.email,
            role: authUser.role,
            createdAt: new Date().toISOString(), // Mock, as AuthUser doesn't have this
            isActive: true,
            lastLogin: new Date().toISOString()
        };
    }, [authUser]);

    // Fetch users list for management (Admin only)
    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser || currentUser.role !== 'super_admin') return;

            try {
                const data = await api.users.getAll();
                const mappedUsers: AdminUser[] = (data || []).map((u: any) => ({
                    id: u.id,
                    username: u.username,
                    name: u.name,
                    email: u.email,
                    role: u.role as UserRole,
                    createdAt: u.created_at,
                    isActive: u.is_active,
                    avatar: u.avatar
                }));
                if (mappedUsers.length > 0) {
                    setUsers(mappedUsers);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };

        fetchUsers();
    }, [currentUser?.role]);

    const login = async (username: string, password: string): Promise<LoginResult> => {
        const email = username; // Assume email for now
        const response = await authLogin(email, password);

        if (!response.success) {
            return {
                success: false,
                error: response.error
            };
        }

        return {
            success: true
        };
    };

    const logout = async () => {
        authLogout();
    };

    const addUser = async (userData: Omit<AdminUser, 'id' | 'createdAt'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
        // This should theoretically be an Edge Function 'admin-create-user'
        // For now we return error as this requires Admin API access not available in client
        return { success: false, error: 'User creation is only available via Supabase Dashboard or Edge Function.' };
    };

    const updateUser = async (id: string, updates: Partial<AdminUser> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
        if (!currentUser) return { success: false, error: 'Unauthorized' };

        try {
            const supabase = getAuthenticatedClient();
            const { error } = await supabase.from('users').update({
                name: updates.name,
                username: updates.username,
                role: updates.role,
                is_active: updates.isActive
            }).eq('id', id);

            if (error) throw error;

            setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
            // No need to update currentUser manually as it tracks authUser, 
            // unless authUser updates. But AdminUser updates here might not reflect in AuthUser immediately.
            // But this is acceptable for now given the architecture.
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Update failed' };
        }
    };

    const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!currentUser || currentUser.role !== 'super_admin') {
            return { success: false, error: 'Unauthorized' };
        }

        try {
            // In Zero-Trust, we check permissions on Server. 
            // We call api.users.delete ideally, or supabase.from('users').delete() 
            // which will be checked by RLS/Postgres Triggers.
            const supabase = getAuthenticatedClient();
            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw error;

            setUsers(users.filter(u => u.id !== id));
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Delete failed' };
        }
    };

    const hasPermission = (permission: keyof RolePermissions): boolean => {
        if (!currentUser) return false;
        return rolePermissions[currentUser.role][permission];
    };

    return (
        <AdminContext.Provider value={{
            isAuthenticated: !!currentUser,
            currentUser,
            users,
            permissions: currentUser ? rolePermissions[currentUser.role] : null,
            sessionExpired: false,
            login,
            logout,
            addUser,
            updateUser,
            deleteUser,
            hasPermission,
            validateUserPassword: validatePassword,
            refreshSession: () => { },
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
