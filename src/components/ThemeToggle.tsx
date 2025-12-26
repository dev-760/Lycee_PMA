/**
 * Theme Toggle Component
 * Switch between light and dark mode with a beautiful animated toggle
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
    variant?: 'default' | 'compact' | 'admin';
}

const ThemeToggle = ({ variant = 'default' }: ThemeToggleProps) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    if (variant === 'compact') {
        return (
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    <Sun className="w-5 h-5 text-gold" />
                ) : (
                    <Moon className="w-5 h-5 text-navy" />
                )}
            </button>
        );
    }

    if (variant === 'admin') {
        return (
            <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    <Sun className="w-5 h-5 text-gold" />
                ) : (
                    <Moon className="w-5 h-5 text-white" />
                )}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Track icons */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5">
                <Sun className="w-4 h-4 text-gold opacity-50" />
                <Moon className="w-4 h-4 text-navy dark:text-gray-400 opacity-50" />
            </div>

            {/* Sliding knob */}
            <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${isDark ? 'left-7' : 'left-1'
                    }`}
            >
                {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-navy" />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-gold" />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;
