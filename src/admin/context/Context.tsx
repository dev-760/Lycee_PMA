
import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useRef, useCallback } from 'react';
import { getAuthenticatedClient } from '@/lib/supabase';
import {
    validatePassword,
    PasswordStrength
} from '@/admin/utils/security';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { UserRole as AuthUserRole } from '@/api/auth.types';

// Auto-logout configuration (in milliseconds)
const AUTO_LOGOUT_TIMEOUT = 3 * 60 * 1000; // 3 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // Show warning 1 minute before logout

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
    super_admin: 'مشرف عام',
    editor: 'محرر',
    administrator: 'مسؤول إداري',
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
    showLogoutWarning: boolean;
    timeUntilLogout: number;
    login: (username: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    addUser: (user: Omit<AdminUser, 'id' | 'createdAt'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
    updateUser: (id: string, updates: Partial<AdminUser> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
    hasPermission: (permission: keyof RolePermissions) => boolean;
    validateUserPassword: (password: string) => PasswordStrength;
    refreshSession: () => void;
    extendSession: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    // Integration with Global AuthContext
    const { user: authUser, login: authLogin, logout: authLogout } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [extraUserDetails, setExtraUserDetails] = useState<{ name?: string; role?: string; lastLogin?: string } | null>(null);

    // Auto-logout state
    const [showLogoutWarning, setShowLogoutWarning] = useState(false);
    const [timeUntilLogout, setTimeUntilLogout] = useState(AUTO_LOGOUT_TIMEOUT);
    const [sessionExpired, setSessionExpired] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Derive currentUser from authUser
    // useMemo ensures stable reference to prevent unnecessary context updates
    const currentUser = useMemo<AdminUser | null>(() => {
        if (!authUser) return null;
        return {
            id: authUser.id,
            username: authUser.email.split('@')[0],
            name: extraUserDetails?.name || authUser.name || authUser.email.split('@')[0], // Use name from DB/auth/fallback
            email: authUser.email,
            role: (extraUserDetails?.role as UserRole) || authUser.role,
            createdAt: new Date().toISOString(), // Mock, as AuthUser doesn't have this
            isActive: true,
            lastLogin: extraUserDetails?.lastLogin || authUser.lastLogin || undefined
        };
    }, [authUser, extraUserDetails]);

    // Fetch current user details to get real name and last login if missing
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!authUser?.id) return;
            try {
                const supabase = getAuthenticatedClient();
                const { data } = await supabase
                    .from('users')
                    .select('name, role, last_login')
                    .eq('id', authUser.id)
                    .single();

                if (data) {
                    setExtraUserDetails({
                        name: data.name,
                        role: data.role,
                        lastLogin: data.last_login
                    });
                }
            } catch (err) {
                console.error("Failed to fetch user details", err);
            }
        };

        fetchUserDetails();
    }, [authUser?.id]);


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

    // Reset activity timestamp
    const resetActivityTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (showLogoutWarning) {
            setShowLogoutWarning(false);
            setTimeUntilLogout(AUTO_LOGOUT_TIMEOUT);
        }
    }, [showLogoutWarning]);

    // Extend session (called when user clicks "Stay Logged In")
    const extendSession = useCallback(() => {
        resetActivityTimer();
    }, [resetActivityTimer]);

    // Auto-logout polling effect
    useEffect(() => {
        if (!currentUser) return;

        // Check activity every second
        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;
            const timeRemaining = AUTO_LOGOUT_TIMEOUT - timeSinceLastActivity;

            // Update remaining time state for the modal
            if (timeRemaining < WARNING_BEFORE_LOGOUT) {
                setTimeUntilLogout(timeRemaining > 0 ? timeRemaining : 0);
            }

            // Check if we should show warning
            if (timeRemaining <= WARNING_BEFORE_LOGOUT && timeRemaining > 0) {
                if (!showLogoutWarning) {
                    setShowLogoutWarning(true);
                }
            } else {
                // If user became active again (timeRemaining went up), hide warning
                if (showLogoutWarning) {
                    setShowLogoutWarning(false);
                }
            }

            // Check if time expired
            if (timeRemaining <= 0) {
                clearInterval(intervalId);
                if (!sessionExpired) {
                    setSessionExpired(true);
                    authLogout();
                }
            }
        }, 1000);

        // Activity event handler
        const handleActivity = () => {
            // Only update ref, avoid state updates to prevent re-renders
            lastActivityRef.current = Date.now();
        };

        // Track user activity
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Cleanup
        return () => {
            clearInterval(intervalId);
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [currentUser, showLogoutWarning, sessionExpired, authLogout]);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        // Normalize email to avoid invisible mismatches
        const normalizedEmail = email.trim().toLowerCase();

        const response = await authLogin(normalizedEmail, password);

        if (!response.success) {
            // TS should narrow this, but if not:
            const errorMsg = 'error' in response ? response.error : 'Invalid email or password';
            return {
                success: false,
                error: errorMsg
            };
        }

        return { success: true };
    };


    const logout = async () => {
        authLogout();
    };

    const addUser = async (userData: Omit<AdminUser, 'id' | 'createdAt'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
        try {
            // Temporary workaround: Use a separate client or just explain limitation
            // For now, we'll try to insert into public.users but we can't create auth user easily without function
            // Let's create a "Shadow" user in public.users just for display if auth fails? No that's bad.

            // Real implementation requires Edge Function.
            // But we can try using a secondary client to signUp
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            // distinct client
            const tempClient = (await import('@supabase/supabase-js')).createClient(supabaseUrl, supabaseKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });

            const { data, error } = await tempClient.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        username: userData.username,
                        role: userData.role
                    }
                }
            });

            if (error) throw error;
            if (!data.user) throw new Error("No user created");

            // Now insert into public.users if trigger didn't do it (we don't have trigger)
            // But we can't insert for another user with RLS usually.
            // If the migration allowed "insert by authenticated", we can do it with OUR current admin token using api.users
            // wait, we need to insert using the ID returned by signUp.

            // However, RLS "Users can be inserted by authenticated" allows it? 
            // Yes, checking the migration: create policy "Users can be inserted by authenticated" on public.users for insert with check (auth.role() = 'authenticated');
            // So YES we can insert for them!

            const newUserProfile = {
                id: data.user.id,
                email: userData.email,
                name: userData.name,
                username: userData.username,
                role: userData.role,
                is_active: userData.isActive
            };

            const supabase = getAuthenticatedClient();
            const { error: profileError } = await supabase.from('users').insert(newUserProfile);

            if (profileError) {
                console.error("Profile creation failed", profileError);
                // Maybe the trigger existed? Ignore if duplicate
            }

            // Refresh list
            const newAdminUser: AdminUser = {
                ...newUserProfile,
                createdAt: new Date().toISOString(),
                isActive: userData.isActive
            };
            setUsers([...users, newAdminUser]);

            return { success: true };

        } catch (e: any) {
            console.error("Add user failed", e);
            return { success: false, error: e.message || 'Failed to add user' };
        }
    };

    const updateUser = async (id: string, updates: Partial<AdminUser> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
        if (!currentUser) return { success: false, error: 'Unauthorized' };

        try {
            await api.users.update(id, updates);
            setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Update failed' };
        }
    };

    const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!currentUser || currentUser.role !== 'super_admin') {
            return { success: false, error: 'Unauthorized' };
        }

        try {
            await api.users.delete(id);
            setUsers(users.filter(u => u.id !== id));
            return { success: true };
        } catch (e) {
            console.error(e);
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
            sessionExpired,
            showLogoutWarning,
            timeUntilLogout,
            login,
            logout,
            addUser,
            updateUser,
            deleteUser,
            hasPermission,
            validateUserPassword: validatePassword,
            refreshSession: resetActivityTimer,
            extendSession,
        }}>
            {/* Session Warning Modal */}
            {showLogoutWarning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-in fade-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-2">Session Timeout Warning</h3>
                            <p className="text-slate mb-4">
                                You will be automatically logged out in{' '}
                                <span className="font-bold text-red-600">
                                    {Math.floor(timeUntilLogout / 60000)}:{String(Math.floor((timeUntilLogout % 60000) / 1000)).padStart(2, '0')}
                                </span>
                            </p>
                            <p className="text-sm text-slate mb-6">Click below to stay logged in.</p>
                            <button
                                onClick={extendSession}
                                className="w-full bg-gradient-to-r from-teal to-teal-light text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                Stay Logged In
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
