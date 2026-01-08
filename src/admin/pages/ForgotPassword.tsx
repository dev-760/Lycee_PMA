import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Mail,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Send
} from 'lucide-react';
import { useLanguage } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { t, language } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;
            const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!PROJECT_REF || !ANON_KEY) {
                throw new Error('Configuration error');
            }

            const response = await fetch(
                `https://${PROJECT_REF}.functions.supabase.co/password_reset`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ANON_KEY}`
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        locale: language
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            setSuccess(true);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(
                language === 'ar'
                    ? 'حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.'
                    : language === 'fr'
                        ? 'Une erreur s\'est produite lors de l\'envoi du lien de réinitialisation. Veuillez réessayer.'
                        : 'An error occurred while sending the reset link. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const getTitle = () => {
        switch (language) {
            case 'ar':
                return 'نسيت كلمة المرور';
            case 'fr':
                return 'Mot de passe oublié';
            default:
                return 'Forgot Password';
        }
    };

    const getSubtitle = () => {
        switch (language) {
            case 'ar':
                return 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور';
            case 'fr':
                return 'Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe';
            default:
                return 'Enter your email and we\'ll send you a link to reset your password';
        }
    };

    const getSuccessMessage = () => {
        switch (language) {
            case 'ar':
                return 'تم إرسال رابط إعادة التعيين! تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.';
            case 'fr':
                return 'Lien de réinitialisation envoyé! Vérifiez votre e-mail et suivez les instructions pour réinitialiser votre mot de passe.';
            default:
                return 'Reset link sent! Check your email and follow the instructions to reset your password.';
        }
    };

    const getBackToLogin = () => {
        switch (language) {
            case 'ar':
                return 'العودة لتسجيل الدخول';
            case 'fr':
                return 'Retour à la connexion';
            default:
                return 'Back to Login';
        }
    };

    const getSendButton = () => {
        if (isLoading) {
            switch (language) {
                case 'ar':
                    return 'جاري الإرسال...';
                case 'fr':
                    return 'Envoi en cours...';
                default:
                    return 'Sending...';
            }
        }
        switch (language) {
            case 'ar':
                return 'إرسال رابط إعادة التعيين';
            case 'fr':
                return 'Envoyer le lien de réinitialisation';
            default:
                return 'Send Reset Link';
        }
    };

    return (
        <>
            <Helmet>
                <title>
                    {getTitle()} – {t('auth', 'controlPanel')}
                </title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-4 relative overflow-hidden">
                {/* Enhanced decorative blobs with animation */}
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
                                <Mail className="w-8 h-8 text-teal" />
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
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <span className="text-sm font-semibold text-center">
                                    {getSuccessMessage()}
                                </span>
                                <Link
                                    to="/admin/login"
                                    className="flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-semibold"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {getBackToLogin()}
                                </Link>
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
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-charcoal mb-2">
                                            {t('auth', 'email')}
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                                <Mail className="w-5 h-5 text-slate group-focus-within:text-teal transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-teal/20 focus:border-teal outline-none transition-all duration-200 placeholder:text-gray-400"
                                                placeholder={t('auth', 'enterEmail')}
                                                required
                                                autoComplete="email"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        className="w-full bg-gradient-to-r from-teal via-teal-light to-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>{getSendButton()}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    {getSendButton()}
                                                </>
                                            )}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-light to-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </button>

                                    {/* Back to Login Link */}
                                    <div className="text-center">
                                        <Link
                                            to="/admin/login"
                                            className="inline-flex items-center gap-2 text-slate hover:text-teal transition-colors text-sm font-medium"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            {getBackToLogin()}
                                        </Link>
                                    </div>
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

export default ForgotPassword;
