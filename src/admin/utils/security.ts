
import { getAuthenticatedClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth-storage';

// Helper to get browser info consistently
const getBrowserInfo = () => {
    if (typeof window === 'undefined') return 'Unknown';
    return window.navigator.userAgent;
};

export interface SecurityEventPayload {
    type: 'login_success' | 'login_failed' | 'logout' | 'session_expired' | 'account_locked' | 'password_change' | 'user_created' | 'user_deleted' | 'role_change';
    userId?: string;
    username?: string;
    severity: 'info' | 'warning' | 'critical';
    details?: string;
    metadata?: Record<string, any>;
}

export const logSecurityEvent = async (event: SecurityEventPayload): Promise<void> => {
    try {
        const supabase = getAuthenticatedClient();
        const session = getSession();

        const { error } = await supabase.from('security_logs').insert({
            event_type: event.type,
            user_id: event.userId || session?.user?.id || null, // Robust user ID fallback
            actor_email: event.username || session?.user?.email,
            description: event.details,
            severity: event.severity,
            user_agent: getBrowserInfo(),
            metadata: event.metadata || {},
        });

        if (error) {
            console.error('Failed to write security log:', error);
        }
    } catch (err) {
        console.error('Unexpected error logging security event:', err);
    }
};

export const getSecurityLogs = async (limit = 100) => {
    try {
        const supabase = getAuthenticatedClient();
        const { data, error } = await supabase
            .from('security_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data.map((log: any) => ({
            id: log.id,
            type: log.event_type as SecurityEventPayload['type'],
            username: log.actor_email,
            severity: log.severity,
            timestamp: new Date(log.created_at).getTime(),
            details: log.description,
            metadata: log.metadata,
            ip: log.ip_address || 'N/A'
        }));
    } catch (err) {
        console.error('Failed to fetch security logs:', err);
        return [];
    }
};

// Simple Password Validation Utilities (Stateless)

export interface PasswordStrength {
    isValid: boolean;
    score: number; // 0-4
    errors: string[];
}

export const validatePassword = (password: string): PasswordStrength => {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
        errors.push('passwordLength');
    } else score++;

    if (/[A-Z]/.test(password)) score++;
    else errors.push('passwordUppercase');

    if (/[a-z]/.test(password)) score++;
    else errors.push('passwordLowercase');

    if (/[0-9]/.test(password)) score++;
    else errors.push('passwordNumber');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    // else errors.push('passwordSpecial'); // Optional usually

    return {
        isValid: errors.length === 0 && password.length >= 8,
        score: Math.min(score, 4),
        errors
    };
};

export const sanitizeInput = (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Account Locking Utilities (Local Storage based)
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LockStatus {
    locked: boolean;
    remainingTime: number; // in minutes
}

function getStoredAttempts(username: string): { attempts: number; lastAttempt: number; lockedUntil: number } {
    try {
        const key = `auth_attempts_${username}`;
        const stored = localStorage.getItem(key);
        if (!stored) return { attempts: 0, lastAttempt: 0, lockedUntil: 0 };
        return JSON.parse(stored);
    } catch {
        return { attempts: 0, lastAttempt: 0, lockedUntil: 0 };
    }
}

export const isAccountLocked = (username: string): LockStatus => {
    if (!username) return { locked: false, remainingTime: 0 };

    const { lockedUntil } = getStoredAttempts(username);
    const now = Date.now();

    if (lockedUntil > now) {
        const remainingMs = lockedUntil - now;
        return {
            locked: true,
            remainingTime: Math.ceil(remainingMs / 60000)
        };
    }

    return { locked: false, remainingTime: 0 };
};

export const getRemainingAttempts = (username: string): number => {
    if (!username) return MAX_ATTEMPTS;

    const { attempts, lockedUntil } = getStoredAttempts(username);
    const now = Date.now();

    if (lockedUntil > now) return 0;

    // Reset attempts if sufficient time passed since last attempt (e.g., 1 hour) without lock
    // For simplicity, we just return max - attempts
    return Math.max(0, MAX_ATTEMPTS - attempts);
};

export const recordFailedAttempt = (username: string): { locked: boolean; remainingAttempts: number; lockedMinutes?: number } => {
    const { attempts, lockedUntil } = getStoredAttempts(username);
    const now = Date.now();

    if (lockedUntil > now) return { locked: true, remainingAttempts: 0 }; // Already locked

    const newAttempts = attempts + 1;
    let newLockedUntil = 0;

    if (newAttempts >= MAX_ATTEMPTS) {
        newLockedUntil = now + LOCK_DURATION_MS;
    }

    localStorage.setItem(`auth_attempts_${username}`, JSON.stringify({
        attempts: newAttempts,
        lastAttempt: now,
        lockedUntil: newLockedUntil
    }));

    if (newLockedUntil > 0) {
        return {
            locked: true,
            remainingAttempts: 0,
            lockedMinutes: Math.ceil(LOCK_DURATION_MS / 60000)
        };
    }

    return {
        locked: false,
        remainingAttempts: MAX_ATTEMPTS - newAttempts
    };
};

export const resetAttempts = (username: string) => {
    localStorage.removeItem(`auth_attempts_${username}`);
};
