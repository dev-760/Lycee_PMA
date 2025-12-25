import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { announcements } from "@/data/mockData";
import { Bell, Calendar, Sparkles, Megaphone } from "lucide-react";
import { useLanguage } from "@/i18n";

const Announcements = () => {
  const { t, language } = useLanguage();

  const pageContent = {
    ar: {
      tag: 'الإعلانات',
      title: 'إعلانات المدرسة',
      description: 'تابع آخر الإعلانات والأنشطة المدرسية',
      important: 'هام',
    },
    en: {
      tag: 'Announcements',
      title: 'School Announcements',
      description: 'Follow the latest announcements and school activities',
      important: 'Important',
    },
    fr: {
      tag: 'Annonces',
      title: 'Annonces scolaires',
      description: 'Suivez les dernières annonces et activités scolaires',
      important: 'Important',
    },
  };

  const content = pageContent[language];

  return (
    <>
      <Helmet>
        <title>{t('nav', 'announcements')} - {t('common', 'siteName')}</title>
        <meta name="description" content={content.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm">
        <Header />
        <main id="main" className="flex-1 py-12">
          <div className="container max-w-3xl">
            {/* Page Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-12 bg-gradient-to-b from-teal to-teal-light rounded-full"></div>
                <div>
                  <div className="flex items-center gap-2 text-teal mb-1">
                    <Megaphone className="w-5 h-5" />
                    <span className="text-sm font-semibold">{content.tag}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-charcoal">{content.title}</h1>
                </div>
              </div>
              <p className="text-slate mr-6">{content.description}</p>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="group bg-white rounded-2xl p-6 shadow-card border border-gray-100/80 flex items-start gap-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3.5 rounded-xl transition-colors ${announcement.urgent
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : 'bg-teal/10 group-hover:bg-teal/20 text-teal'
                    }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.urgent && (
                        <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          {content.important}
                        </span>
                      )}
                      <h3 className="font-bold text-charcoal group-hover:text-teal transition-colors">{announcement.title}</h3>
                    </div>
                    <span className="text-slate text-sm flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal/70" />
                      {announcement.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Announcements;
