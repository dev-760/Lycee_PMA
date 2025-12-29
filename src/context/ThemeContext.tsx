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
    // Ensure light mode is always set
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        document.body.style.backgroundColor = '#F4F1EC';
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
