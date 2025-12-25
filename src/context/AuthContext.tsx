import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, UserRole } from "@/api/auth.types";
import { secureLogin } from "@/api/secureLogin";
import { getSession, saveSession, clearSession } from "@/lib/auth-storage";

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login(email: string, password: string): Promise<boolean>;
    logout(): void;
    hasRole(roles: UserRole[]): boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const session = getSession();
        if (session?.success) {
            setUser(session.user);
        }
    }, []);

    async function login(email: string, password: string) {
        const response = await secureLogin(email, password);
        if (!response.success) return false;

        saveSession(response);
        setUser(response.user);
        return true;
    }

    function logout() {
        clearSession();
        setUser(null);
    }

    function hasRole(roles: UserRole[]) {
        return user ? roles.includes(user.role) : false;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
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
