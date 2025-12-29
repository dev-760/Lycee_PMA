import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, UserRole } from "@/api/auth.types";
import { secureLogin } from "@/api/secureLogin";
import { getSession, saveSession, clearSession } from "@/lib/auth-storage";

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login(email: string, password: string): Promise<import("@/api/auth.types").AuthResponse>;
    logout(): void;
    hasRole(roles: UserRole[]): boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const session = getSession();
        if (session?.success) {
            setUser(session.user);
        }
    }, []);

    async function login(email: string, password: string) {
        setIsLoading(true);
        try {
            const response = await secureLogin(email, password);
            if (response.success) {
                saveSession(response);
                setUser(response.user);
            }
            return response;
        } finally {
            setIsLoading(false);
        }
    }

    function logout() {
        clearSession();
        setUser(null);
    }

    function hasRole(roles: UserRole[]) {
        if (!user) {
            console.log("hasRole: No user found");
            return false;
        }
        const userRole = user.role;
        const hasAccess = roles.includes(userRole);
        console.log("hasRole check:", {
            userRole,
            allowedRoles: roles,
            hasAccess,
            user: user
        });
        return hasAccess;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                isLoading,
                login,
                logout,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
