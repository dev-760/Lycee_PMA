/**
 * Beautiful Loading Spinner Component
 * A premium animated loading indicator with multiple variants
 */

import { useLanguage } from '@/i18n';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse';
    text?: string;
    fullScreen?: boolean;
}

const LoadingSpinner = ({
    size = 'lg',
    variant = 'spinner',
    text,
    fullScreen = true
}: LoadingSpinnerProps) => {
    const { t } = useLanguage();

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-gradient-warm'
        : 'flex items-center justify-center py-12';

    const displayText = text ?? t('common', 'loading');

    // Premium Spinner variant
    const SpinnerVariant = () => (
        <div className="relative">
            {/* Outer ring */}
            <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 dark:border-gray-700`} />

            {/* Animated spinning arc */}
            <div
                className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-gold animate-spin`}
                style={{ animationDuration: '0.8s' }}
            />

            {/* Inner pulsing dot */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="w-3 h-3 bg-gradient-to-br from-gold to-gold-light rounded-full animate-pulse"
                    style={{ animationDuration: '1s' }}
                />
            </div>
        </div>
    );

    // Dots variant
    const DotsVariant = () => (
        <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-3 h-3 bg-gold rounded-full animate-bounce"
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.6s'
                    }}
                />
            ))}
        </div>
    );

    // Pulse variant
    const PulseVariant = () => (
        <div className="relative">
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-navy to-navy-light rounded-full animate-pulse`} />
            <div
                className={`${sizeClasses[size]} absolute top-0 left-0 bg-gold/30 rounded-full animate-ping`}
                style={{ animationDuration: '1.5s' }}
            />
        </div>
    );

    const renderVariant = () => {
        switch (variant) {
            case 'dots':
                return <DotsVariant />;
            case 'pulse':
                return <PulseVariant />;
            default:
                return <SpinnerVariant />;
        }
    };

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute -inset-2 border-2 border-gold/30 rounded-3xl animate-pulse" />
                </div>

                {/* Spinner */}
                {renderVariant()}

                {/* Loading text with shimmer effect */}
                <div className="relative overflow-hidden">
                    <p className="text-lg font-semibold text-navy dark:text-gray-200">
                        {displayText}
                    </p>
                    {/* Shimmer overlay */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer"
                        style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                    />
                </div>
            </div>

            {/* Add shimmer animation to global styles */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default LoadingSpinner;
