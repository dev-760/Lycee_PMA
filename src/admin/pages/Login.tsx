import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Lock,
    User,
    LogIn,
    AlertCircle,
    Eye,
    EyeOff,
    Clock
} from 'lucide-react';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            setWarning(
                language === 'ar'
                    ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى'
                    : language === 'fr'
                        ? 'Session expirée. Veuillez vous reconnecter'
                        : 'Session expired. Please log in again'
            );
        }
    }, [sessionExpired, language]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setWarning('');
        setIsLoading(true);

        // Small delay to prevent brute-force timing attacks
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error || t('auth', 'loginError'));
        }

        setIsLoading(false);
    };

    if (isAuthenticated) return null;

    return (
        <>
            <Helmet>
                <title>
                    {t('auth', 'login')} – {t('auth', 'controlPanel')}
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
                    {/* Enhanced Logo */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/95 backdrop-blur-sm mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                    </div>

                    {/* Enhanced Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4 shadow-lg">
                                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-charcoal mb-2">
                                {t('auth', 'login')}
                            </h2>
                            <p className="text-slate text-sm">
                                Lycée PMA panel
                            </p>
                        </div>

                        {/* Session expired */}
                        {warning && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex items-center gap-3 text-amber-700 shadow-lg animate-slide-down">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="text-sm font-semibold flex-1">
                                    {warning}
                                </span>
                            </div>
                        )}

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
                                    {t('auth', 'Email')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                        <User className="w-5 h-5 text-slate group-focus-within:text-teal transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-teal/20 focus:border-teal outline-none transition-all duration-200 placeholder:text-gray-400"
                                        placeholder={t('auth', ' Enter Email')}
                                        required
                                        autoComplete="email"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-charcoal mb-2">
                                    {t('auth', 'password')}
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
                                        placeholder={t('auth', 'enterPassword')}
                                        required
                                        autoComplete="current-password"
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full bg-gradient-to-r from-teal via-teal-light to-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            {t('auth', 'loginButton')}
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-light to-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        </form>
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
                .delay-300 {
                    animation-delay: 0.3s;
                }
            `}</style>
        </>
    );
};

export default AdminLogin;
