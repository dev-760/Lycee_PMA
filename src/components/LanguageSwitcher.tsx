import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '@/i18n';

interface LanguageSwitcherProps {
    variant?: 'header' | 'footer' | 'admin';
}

const languages: { code: Language; name: string }[] = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
];

const LanguageSwitcher = ({ variant = 'header' }: LanguageSwitcherProps) => {
    const { language, setLanguage, isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    // Text colors based on variant
    const textStyles = {
        header: 'text-white/80 hover:text-teal',
        footer: 'text-white/70 hover:text-teal',
        admin: 'text-charcoal hover:text-teal',
    };

    const dropdownBg = {
        header: 'bg-charcoal border-white/20',
        footer: 'bg-charcoal-light border-white/10',
        admin: 'bg-white border-gray-200 shadow-lg',
    };

    const dropdownText = {
        header: 'text-white/80 hover:bg-white/10 hover:text-white',
        footer: 'text-white/80 hover:bg-white/10 hover:text-white',
        admin: 'text-charcoal hover:bg-gray-50',
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${textStyles[variant]}`}
            >
                <span>{currentLang.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`absolute top-full mt-2 ${isRTL ? 'right-0' : 'left-0'} z-50 min-w-[120px] rounded-lg border overflow-hidden ${dropdownBg[variant]}`}>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${dropdownText[variant]} ${language === lang.code ? 'bg-teal/10 text-teal font-semibold' : ''
                                    }`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
