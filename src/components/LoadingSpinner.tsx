/**
 * Modern Minimalist Loading Spinner
 * Clean, professional, and elegant
 */

import { useLanguage } from '@/i18n';

interface LoadingSpinnerProps {
    text?: string;
    fullScreen?: boolean;
    transparent?: boolean;
}

const LoadingSpinner = ({
    text,
    fullScreen = true,
    transparent = false
}: LoadingSpinnerProps) => {
    const { t } = useLanguage();
    const displayText = text ?? t('common', 'loading');

    const containerClasses = fullScreen
        ? 'fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm'
        : `flex items-center justify-center py-12 ${transparent ? '' : 'bg-transparent'}`;

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-8">
                {/* Logo & Spinner Container */}
                <div className="relative flex items-center justify-center w-24 h-24">
                    {/* Spinning Gold Ring */}
                    <div
                        className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-gold border-r-gold/50 animate-spin"
                        style={{ animationDuration: '1.5s' }}
                    />

                    {/* Static Inner Ring (Navy) */}
                    <div className="absolute inset-1 rounded-full border border-navy/10" />

                    {/* Logo */}
                    <div className="relative w-14 h-14 flex items-center justify-center animate-pulse-slow">
                        <img
                            src="/logo.png"
                            alt="Loading..."
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-navy font-semibold text-lg tracking-wide uppercase text-xs">
                        {displayText}
                    </span>
                    {/* Progress Line */}
                    <div className="w-16 h-0.5 bg-navy/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold w-1/3 animate-indeterminate" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.95); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                @keyframes indeterminate {
                    0% { transform: translateX(-100%); width: 20%; }
                    50% { width: 50%; }
                    100% { transform: translateX(200%); width: 20%; }
                }
                .animate-indeterminate {
                    animation: indeterminate 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
