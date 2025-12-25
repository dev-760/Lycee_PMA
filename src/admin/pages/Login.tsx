import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, User, LogIn, AlertCircle, Newspaper, Eye, EyeOff, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { isAccountLocked, getRemainingAttempts } from '@/admin/utils/security';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const [lockedMinutes, setLockedMinutes] = useState<number | null>(null);
    const { login, isAuthenticated, sessionExpired } = useAdmin();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Show session expired message
    useEffect(() => {
        if (sessionExpired) {
            setWarning(language === 'ar'
                ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى'
                : language === 'fr'
                    ? 'Session expirée. Veuillez vous reconnecter'
                    : 'Session expired. Please log in again');
        }
    }, [sessionExpired, language]);

    // Check account lock status on username change
    useEffect(() => {
        if (username) {
            const lockStatus = isAccountLocked(username);
            if (lockStatus.locked) {
                setLockedMinutes(lockStatus.remainingTime);
                setRemainingAttempts(null);
            } else {
                setLockedMinutes(null);
                const remaining = getRemainingAttempts(username);
                if (remaining < 5 && remaining > 0) {
                    setRemainingAttempts(remaining);
                } else {
                    setRemainingAttempts(null);
                }
            }
        } else {
            setLockedMinutes(null);
            setRemainingAttempts(null);
        }
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setWarning('');
        setIsLoading(true);

        // Simulate API delay for security
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = await login(username, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error || t('auth', 'loginError'));
            if (result.remainingAttempts !== undefined) {
                setRemainingAttempts(result.remainingAttempts);
            }
            if (result.lockedMinutes !== undefined) {
                setLockedMinutes(result.lockedMinutes);
            }
        }
        setIsLoading(false);
    };

    const getSecurityMessage = () => {
        const messages = {
            ar: {
                locked: `الحساب مقفل مؤقتاً. المحاولة بعد ${lockedMinutes} دقيقة`,
                attempts: `تبقى ${remainingAttempts} محاولات قبل قفل الحساب`,
            },
            en: {
                locked: `Account temporarily locked. Try again in ${lockedMinutes} minutes`,
                attempts: `${remainingAttempts} attempts remaining before lockout`,
            },
            fr: {
                locked: `Compte temporairement verrouillé. Réessayez dans ${lockedMinutes} minutes`,
                attempts: `${remainingAttempts} tentatives restantes avant le verrouillage`,
            }
        };
        return messages[language] || messages.en;
    };

    if (isAuthenticated) return null;

    return (
        <>
            <Helmet>
                <title>{t('auth', 'login')} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-4 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-20 -left-20 w-72 h-72 bg-teal/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/5 rounded-full blur-3xl"></div>

                {/* Language Switcher */}
                <div className="absolute top-4 right-4 z-20">
                    <LanguageSwitcher variant="header" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white mb-4 shadow-lg shadow-white/20">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{t('auth', 'controlPanel')}</h1>
                        <p className="text-white/60 text-sm">{t('common', 'siteName')}</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
                        <h2 className="text-xl font-bold text-charcoal mb-6 text-center">{t('auth', 'login')}</h2>

                        {/* Session Expired Warning */}
                        {warning && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-600">
                                <Clock className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{warning}</span>
                            </div>
                        )}

                        {/* Account Locked Warning */}
                        {lockedMinutes && lockedMinutes > 0 && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
                                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-sm font-bold block">{language === 'ar' ? 'الحساب مقفل مؤقتاً' : language === 'fr' ? 'Compte temporairement verrouillé' : 'Account Temporarily Locked'}</span>
                                    <span className="text-xs">{getSecurityMessage().locked}</span>
                                </div>
                            </div>
                        )}

                        {/* Remaining Attempts Warning */}
                        {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 5 && !lockedMinutes && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs font-medium">{getSecurityMessage().attempts}</span>
                            </div>
                        )}

                        {/* Login Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('auth', 'username')}</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
                                        placeholder={t('auth', 'enterUsername')}
                                        required
                                        autoComplete="username"
                                        disabled={isLoading || (lockedMinutes !== null && lockedMinutes > 0)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('auth', 'password')}</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pr-12 pl-12 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
                                        placeholder={t('auth', 'enterPassword')}
                                        required
                                        autoComplete="current-password"
                                        disabled={isLoading || (lockedMinutes !== null && lockedMinutes > 0)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal transition-colors"
                                        disabled={isLoading || (lockedMinutes !== null && lockedMinutes > 0)}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || (lockedMinutes !== null && lockedMinutes > 0)}
                                className="w-full bg-gradient-to-r from-teal to-teal-light text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-teal/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : lockedMinutes && lockedMinutes > 0 ? (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        {language === 'ar' ? 'الحساب مقفل' : language === 'fr' ? 'Compte verrouillé' : 'Account Locked'}
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        {t('auth', 'loginButton')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Back to site link */}
                    <div className="text-center mt-6">
                        <a href="/" className="text-white/60 hover:text-teal text-sm transition-colors inline-flex items-center gap-2">
                            <span>←</span>
                            {t('nav', 'backToSite')}
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-white/40 text-xs">
                            © {new Date().getFullYear()} {t('auth', 'allRightsReserved')}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </>
    );
};

export default AdminLogin;
