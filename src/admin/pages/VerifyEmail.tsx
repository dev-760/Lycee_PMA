import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const VerifyEmail = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');

    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get tokens from URL
    const accessToken = searchParams.get('access_token') ||
        searchParams.get('token') ||
        window.location.hash.match(/access_token=([^&]*)/)?.[1];
    const type = searchParams.get('type') || 'signup';

    useEffect(() => {
        const verifyEmail = async () => {
            if (!accessToken) {
                setError(getInvalidLinkMessage());
                setIsLoading(false);
                return;
            }

            try {
                const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;
                const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

                if (!PROJECT_REF || !ANON_KEY) {
                    throw new Error('Configuration error');
                }

                const response = await fetch(
                    `https://${PROJECT_REF}.functions.supabase.co/verify_email`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ type }),
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Verification failed');
                }

                setVerified(true);
            } catch (err: any) {
                console.error('Email verification error:', err);
                setError(getErrorMessage());
            } finally {
                setIsLoading(false);
            }
        };

        verifyEmail();
    }, [accessToken, type]);

    const getTitle = () => {
        switch (language) {
            case 'ar':
                return 'تأكيد البريد الإلكتروني';
            case 'fr':
                return 'Vérification de l\'e-mail';
            default:
                return 'Email Verification';
        }
    };

    const getVerifyingMessage = () => {
        switch (language) {
            case 'ar':
                return 'جاري التحقق من بريدك الإلكتروني...';
            case 'fr':
                return 'Vérification de votre e-mail...';
            default:
                return 'Verifying your email...';
        }
    };

    const getSuccessMessage = () => {
        switch (language) {
            case 'ar':
                return 'تم تأكيد بريدك الإلكتروني بنجاح!';
            case 'fr':
                return 'Votre e-mail a été vérifié avec succès!';
            default:
                return 'Your email has been verified successfully!';
        }
    };

    const getSuccessSubtext = () => {
        switch (language) {
            case 'ar':
                return 'يمكنك الآن تسجيل الدخول إلى حسابك';
            case 'fr':
                return 'Vous pouvez maintenant vous connecter à votre compte';
            default:
                return 'You can now log in to your account';
        }
    };

    const getInvalidLinkMessage = () => {
        switch (language) {
            case 'ar':
                return 'رابط التحقق غير صالح أو منتهي الصلاحية';
            case 'fr':
                return 'Le lien de vérification est invalide ou a expiré';
            default:
                return 'Verification link is invalid or expired';
        }
    };

    const getErrorMessage = () => {
        switch (language) {
            case 'ar':
                return 'حدث خطأ أثناء التحقق من البريد الإلكتروني. يرجى المحاولة مرة أخرى.';
            case 'fr':
                return 'Une erreur s\'est produite lors de la vérification. Veuillez réessayer.';
            default:
                return 'An error occurred during verification. Please try again.';
        }
    };

    const getLoginButton = () => {
        switch (language) {
            case 'ar':
                return 'الانتقال لتسجيل الدخول';
            case 'fr':
                return 'Aller à la connexion';
            default:
                return 'Go to Login';
        }
    };

    const getContactSupport = () => {
        switch (language) {
            case 'ar':
                return 'إذا استمرت المشكلة، يرجى الاتصال بالدعم.';
            case 'fr':
                return 'Si le problème persiste, veuillez contacter le support.';
            default:
                return 'If the problem persists, please contact support.';
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
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                        <div className="text-center">
                            {isLoading ? (
                                /* Loading State */
                                <>
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal/20 to-teal/10 mb-6 shadow-lg">
                                        <Loader2 className="w-10 h-10 text-teal animate-spin" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-charcoal mb-4">
                                        {getTitle()}
                                    </h2>
                                    <p className="text-slate">
                                        {getVerifyingMessage()}
                                    </p>
                                </>
                            ) : verified ? (
                                /* Success State */
                                <>
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-50 mb-6 shadow-lg animate-bounce-in">
                                        <ShieldCheck className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-charcoal mb-4">
                                        {getSuccessMessage()}
                                    </h2>
                                    <p className="text-slate mb-8">
                                        {getSuccessSubtext()}
                                    </p>
                                    <button
                                        onClick={() => navigate('/admin/login')}
                                        className="w-full bg-gradient-to-r from-teal via-teal-light to-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        {getLoginButton()}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                /* Error State */
                                <>
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-6 shadow-lg">
                                        <AlertCircle className="w-10 h-10 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-charcoal mb-4">
                                        {language === 'ar' ? 'فشل التحقق' : language === 'fr' ? 'Échec de la vérification' : 'Verification Failed'}
                                    </h2>
                                    <p className="text-slate mb-4">
                                        {error}
                                    </p>
                                    <p className="text-sm text-slate/70 mb-8">
                                        {getContactSupport()}
                                    </p>
                                    <button
                                        onClick={() => navigate('/admin/login')}
                                        className="w-full bg-gradient-to-r from-teal via-teal-light to-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        {getLoginButton()}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-white/40 text-xs">
                        © {new Date().getFullYear()} {t('auth', 'allRightsReserved')}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </>
    );
};

export default VerifyEmail;
