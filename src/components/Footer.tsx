import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowUp } from "lucide-react";
import { useLanguage } from "@/i18n";

const Footer = () => {
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav', 'home'), href: '/' },
    { name: t('nav', 'articles'), href: '/articles' },
    { name: t('nav', 'news'), href: '/news' },
    { name: t('nav', 'announcements'), href: '/announcements' },
    { name: t('nav', 'contact'), href: '/contact' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#000000' }} className="text-white">
      {/* Gold Accent Line at Top */}
      <div style={{ height: '3px', backgroundColor: '#D4AF37' }}></div>

      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/logo.png"
                alt="Lycée Prince Moulay Abdellah"
                className="h-16 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="text-white/70 leading-relaxed mb-6 max-w-md">
              {t('footer', 'aboutDescription')}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }}></span>
              {t('footer', 'quickLinks')}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 transition-colors flex items-center gap-2 group"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#D4AF37'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    <span
                      className="w-0 group-hover:w-2 h-0.5 transition-all"
                      style={{ backgroundColor: '#D4AF37' }}
                    ></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }}></span>
              {t('footer', 'contactUs')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <MapPin className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <span className="text-white/70">{t('footer', 'address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Phone className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <span className="text-white/70" dir="ltr">+212 5XX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Mail className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <span className="text-white/70">info@lycee-pma.ma</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm text-center sm:text-start">
            © {currentYear} {t('common', 'siteName')}. {t('footer', 'copyright')}
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:-translate-y-1 shadow-lg"
            style={{ backgroundColor: '#D4AF37', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}
            aria-label="العودة للأعلى"
          >
            <ArrowUp className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
