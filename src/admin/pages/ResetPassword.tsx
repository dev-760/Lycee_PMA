import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    KeyRound,
    ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Supabase sends tokens in the URL hash fragment like:
        // #access_token=...&expires_at=...&expires_in=...&refresh_token=...&token_type=bearer&type=recovery

        const hash = window.location.hash.substring(1); // Remove the '#'
        const hashParams = new URLSearchParams(hash);

        // Try to get access_token from hash first (Supabase's preferred method)
        let token = hashParams.get('access_token');
        const type = hashParams.get('type');

        // If not in hash, try query params (fallback)
        if (!token) {
            token = searchParams.get('access_token') || searchParams.get('token');
        }

        console.log('[ResetPassword] Token extraction:', {
            hasHash: !!hash,
            type,
            hasToken: !!token
        });

        // Validate token and type
        if (token && (type === 'recovery' || !type)) {
            setAccessToken(token);
            setTokenValid(true);

            // Clean up the URL (remove hash) for cleaner display
            if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        } else {
            setTokenValid(false);
        }
    }, [searchParams]);

    const getTitle = () => {
        switch (language) {
            case 'ar':
                return 'إعادة تعيين كلمة المرور';
            case 'fr':
                return 'Réinitialiser le mot de passe';
            default:
                return 'Reset Password';
        }
    };

    const getSubtitle = () => {
        switch (language) {
            case 'ar':
                return 'أدخل كلمة المرور الجديدة';
            case 'fr':
                return 'Entrez votre nouveau mot de passe';
            default:
                return 'Enter your new password';
        }
    };

    const getPasswordLabel = () => {
        switch (language) {
            case 'ar':
                return 'كلمة المرور الجديدة';
            case 'fr':
                return 'Nouveau mot de passe';
            default:
                return 'New Password';
        }
    };

    const getConfirmPasswordLabel = () => {
        switch (language) {
            case 'ar':
                return 'تأكيد كلمة المرور';
            case 'fr':
                return 'Confirmer le mot de passe';
            default:
                return 'Confirm Password';
        }
    };

    const getPasswordPlaceholder = () => {
        switch (language) {
            case 'ar':
                return 'أدخل كلمة المرور الجديدة';
            case 'fr':
                return 'Entrez le nouveau mot de passe';
            default:
                return 'Enter new password';
        }
    };

    const getConfirmPlaceholder = () => {
        switch (language) {
            case 'ar':
                return 'أعد إدخال كلمة المرور';
            case 'fr':
                return 'Confirmez le mot de passe';
            default:
                return 'Confirm your password';
        }
    };

    const getSuccessMessage = () => {
        switch (language) {
            case 'ar':
                return 'تم تغيير كلمة المرور بنجاح! جاري تحويلك لصفحة تسجيل الدخول...';
            case 'fr':
                return 'Mot de passe modifié avec succès! Redirection vers la page de connexion...';
            default:
                return 'Password changed successfully! Redirecting to login page...';
        }
    };

    const getInvalidTokenMessage = () => {
        switch (language) {
            case 'ar':
                return 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.';
            case 'fr':
                return 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.';
            default:
                return 'Reset link is invalid or expired. Please request a new link.';
        }
    };

    const getPasswordMismatchError = () => {
        switch (language) {
            case 'ar':
                return 'كلمات المرور غير متطابقة';
            case 'fr':
                return 'Les mots de passe ne correspondent pas';
            default:
                return 'Passwords do not match';
        }
    };

    const getPasswordTooShortError = () => {
        switch (language) {
            case 'ar':
                return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
            case 'fr':
                return 'Le mot de passe doit contenir au moins 8 caractères';
            default:
                return 'Password must be at least 8 characters';
        }
    };

    const getResetButton = () => {
        if (isLoading) {
            switch (language) {
                case 'ar':
                    return 'جاري التحديث...';
                case 'fr':
                    return 'Mise à jour...';
                default:
                    return 'Updating...';
            }
        }
        switch (language) {
            case 'ar':
                return 'تحديث كلمة المرور';
            case 'fr':
                return 'Mettre à jour le mot de passe';
            default:
                return 'Update Password';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError(getPasswordMismatchError());
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError(getPasswordTooShortError());
            return;
        }

        setIsLoading(true);

        try {
            const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;
            const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!PROJECT_REF || !ANON_KEY) {
                throw new Error('Configuration error');
            }

            const response = await fetch(
                `https://${PROJECT_REF}.functions.supabase.co/update_password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'apikey': ANON_KEY
                    },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to update password');
            }

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/admin/login');
            }, 3000);
        } catch (err: any) {
            console.error('Password update error:', err);
            setError(
                language === 'ar'
                    ? 'حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى.'
                    : language === 'fr'
                        ? 'Une erreur s\'est produite lors de la mise à jour du mot de passe. Veuillez réessayer.'
                        : 'An error occurred while updating your password. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking token
    if (tokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal">
                <div className="w-8 h-8 border-4 border-teal/30 border-t-teal rounded-full animate-spin" />
            </div>
        );
    }

    // Show invalid token message
    if (tokenValid === false) {
        return (
            <>
                <Helmet>
                    <title>{getTitle()} – {t('auth', 'controlPanel')}</title>
                </Helmet>

                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-4 relative overflow-hidden">
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

                    <div className="absolute top-4 right-4 z-20">
                        <LanguageSwitcher variant="header" />
                    </div>

                    <div className="w-full max-w-md relative z-10 animate-fade-in">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-6 shadow-lg">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-charcoal mb-4">
                                    {language === 'ar' ? 'رابط غير صالح' : language === 'fr' ? 'Lien invalide' : 'Invalid Link'}
                                </h2>
                                <p className="text-slate mb-6">
                                    {getInvalidTokenMessage()}
                                </p>
                                <a
                                    href="/admin/forgot-password"
                                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-teal via-teal-light to-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {language === 'ar' ? 'طلب رابط جديد' : language === 'fr' ? 'Demander un nouveau lien' : 'Request New Link'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.6s ease-out;
                    }
                    .delay-1000 {
                        animation-delay: 1s;
                    }
                `}</style>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>
                    {getTitle()} – {t('auth', 'controlPanel')}
                </title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-4 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-20 -left-20 w-72 h-72 bg-teal/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/5 rounded-full blur-3xl" />

                {/* Language switcher */}
                <div className="absolute top-4 right-4 z-20">
                    <LanguageSwitcher variant="header" />
                </div>

                <div className="w-full max-w-md relative z-10 animate-fade-in">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/95 backdrop-blur-sm mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal/20 to-teal/10 mb-4 shadow-lg">
                                <KeyRound className="w-8 h-8 text-teal" />
                            </div>
                            <h2 className="text-2xl font-bold text-charcoal mb-2">
                                {getTitle()}
                            </h2>
                            <p className="text-slate text-sm">
                                {getSubtitle()}
                            </p>
                        </div>

                        {/* Success message */}
                        {success ? (
                            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl flex flex-col items-center gap-4 text-green-700 shadow-lg animate-slide-down">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <ShieldCheck className="w-8 h-8 text-green-600" />
                                </div>
                                <span className="text-sm font-semibold text-center">
                                    {getSuccessMessage()}
                                </span>
                                <div className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Error */}
                                {error && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl flex items-center gap-3 text-red-700 shadow-lg animate-shake">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-sm font-semibold flex-1">
                                            {error}
                                        </span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-charcoal mb-2">
                                            {getPasswordLabel()}
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                                <Lock className="w-5 h-5 text-slate group-focus-within:text-teal transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pr-12 pl-12 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-teal/20 focus:border-teal outline-none transition-all duration-200 placeholder:text-gray-400"
                                                placeholder={getPasswordPlaceholder()}
                                                required
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate hover:text-teal transition-colors p-1 rounded-lg hover:bg-gray-100"
                                                disabled={isLoading}
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-charcoal mb-2">
                                            {getConfirmPasswordLabel()}
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                                <Lock className="w-5 h-5 text-slate group-focus-within:text-teal transition-colors" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className="w-full pr-12 pl-12 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-teal/20 focus:border-teal outline-none transition-all duration-200 placeholder:text-gray-400"
                                                placeholder={getConfirmPlaceholder()}
                                                required
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate hover:text-teal transition-colors p-1 rounded-lg hover:bg-gray-100"
                                                disabled={isLoading}
                                                aria-label="Toggle confirm password visibility"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password requirements hint */}
                                    <div className="text-xs text-slate bg-gray-50 p-3 rounded-xl">
                                        <p className="flex items-center gap-2">
                                            <CheckCircle className={`w-4 h-4 ${password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                                            {language === 'ar'
                                                ? '8 أحرف على الأقل'
                                                : language === 'fr'
                                                    ? 'Au moins 8 caractères'
                                                    : 'At least 8 characters'}
                                        </p>
                                        <p className="flex items-center gap-2 mt-1">
                                            <CheckCircle className={`w-4 h-4 ${password && password === confirmPassword ? 'text-green-500' : 'text-gray-300'}`} />
                                            {language === 'ar'
                                                ? 'كلمات المرور متطابقة'
                                                : language === 'fr'
                                                    ? 'Les mots de passe correspondent'
                                                    : 'Passwords match'}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !password || !confirmPassword}
                                        className="w-full bg-gradient-to-r from-teal via-teal-light to-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>{getResetButton()}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    {getResetButton()}
                                                </>
                                            )}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-light to-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-white/40 text-xs">
                        © {new Date().getFullYear()} {t('auth', 'allRightsReserved')}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    20%,60% { transform: translateX(-5px); }
                    40%,80% { transform: translateX(5px); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </>
    );
};

export default ResetPassword;
