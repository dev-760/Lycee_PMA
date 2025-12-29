import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, Clock } from "lucide-react";
import { useLanguage } from "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const { t, language } = useLanguage();

  // Get nav links with translations
  const navLinks = [
    { name: t('nav', 'home'), href: '/' },
    { name: t('nav', 'articles'), href: '/articles' },
    { name: t('nav', 'news'), href: '/news' },
    { name: t('nav', 'announcements'), href: '/announcements' },
    { name: t('nav', 'contact'), href: '/contact' },
  ];

  // Get current date in appropriate locale
  const getLocale = () => {
    switch (language) {
      case 'ar': return 'ar-MA';
      case 'fr': return 'fr-FR';
      default: return 'en-US';
    }
  };

  const currentDate = new Date().toLocaleDateString(getLocale(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time
  const formattedTime = currentTime.toLocaleTimeString(getLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: language === 'ar'
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Skip Link for Accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 px-4 py-2 rounded-lg shadow-lg z-50"
        style={{ backgroundColor: '#000000', color: '#F5F5F5' }}
      >
        {t('nav', 'skipToContent')}
      </a>

      {/* Top Bar - Deep Black */}
      <div style={{ backgroundColor: '#000000' }} className="py-2.5 border-b border-white/10">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#F5F5F5' }}>
            <Calendar className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <span className="font-medium">{currentDate}</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer hover:opacity-80"
              style={{
                color: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderColor: 'rgba(212, 175, 55, 0.3)'
              }}
              title={t('auth', 'controlPanel')}
            >
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
            </Link>
            <LanguageSwitcher variant="header" />
          </div>
        </div>
      </div>

      {/* Gold Accent Line */}
      <div style={{ height: '3px', backgroundColor: '#D4AF37' }}></div>

      {/* Main Header - Deep Black Background */}
      <div
        className={`transition-all duration-300 ${isScrolled ? 'shadow-nav py-3' : 'py-5'} border-b border-white/10 backdrop-blur-sm`}
        style={{ backgroundColor: '#000000' }}
      >
        <div className="container">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src="/logo.png"
                  alt="Lycée Prince Moulay Abdellah"
                  className="relative h-14 md:h-16 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav role="navigation" aria-label="رئيسية الموقع" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className={`relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300`}
                      style={{
                        color: isActiveLink(link.href) ? '#D4AF37' : '#F5F5F5'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveLink(link.href)) {
                          e.currentTarget.style.color = '#D4AF37';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveLink(link.href)) {
                          e.currentTarget.style.color = '#F5F5F5';
                        }
                      }}
                    >
                      {link.name}
                      {isActiveLink(link.href) && (
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full"
                          style={{ backgroundColor: '#D4AF37' }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative p-2.5 rounded-xl transition-all duration-300"
              style={{
                backgroundColor: isMenuOpen ? '#000000' : '#1A1A1A',
                color: isMenuOpen ? '#F5F5F5' : '#F5F5F5'
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="قائمة التنقل"
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-6 h-6">
                <Menu className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                <X className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[140px] backdrop-blur-xl shadow-hover z-40 transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}
      >
        <nav className="container py-6" role="navigation" aria-label="التنقل المحمول">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <li
                key={link.name}
                className="animate-slide-down"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  to={link.href}
                  className="flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 font-semibold text-base"
                  style={{
                    backgroundColor: isActiveLink(link.href) ? '#1A1A1A' : 'transparent',
                    color: isActiveLink(link.href) ? '#D4AF37' : '#F5F5F5'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.name}</span>
                  {isActiveLink(link.href) && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }}></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Quick Info */}
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm" style={{ color: '#F5F5F5' }}>
              <Calendar className="w-4 h-4" style={{ color: '#D4AF37' }} />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="admin" />
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-sm z-30"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
