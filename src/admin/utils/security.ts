
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
        errors.push('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل');
    } else score++;

    if (/[A-Z]/.test(password)) score++;
    else errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');

    if (/[a-z]/.test(password)) score++;
    else errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');

    if (/[0-9]/.test(password)) score++;
    else errors.push('يجب أن تحتوي على رقم واحد على الأقل');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

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
