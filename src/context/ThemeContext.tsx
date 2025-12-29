/**
 * Theme Context
 * Provides light mode support (dark mode removed)
 */

import { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    theme: 'light';
    isDark: false;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Ensure dark background is always set
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        document.body.style.backgroundColor = '#000000';
    }, []);

    return (
        <ThemeContext.Provider value={{
            theme: 'light',
            isDark: false
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeProvider;
