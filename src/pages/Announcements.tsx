import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Bell, Calendar, Sparkles, Megaphone, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n";
import { api } from "@/lib/api";
import { Announcement } from "@/types";

const Announcements = () => {
  const { t, language, isRTL } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements from Supabase
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.announcements.getAll();
        setAnnouncements(data || []);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const pageContent = {
    ar: {
      tag: "الإعلانات",
      title: "إعلانات المدرسة",
      description: "تابع آخر الإعلانات والأنشطة المدرسية",
      important: "هام",
      empty: "لا توجد إعلانات حالياً",
      loading: "جاري التحميل...",
    },
    en: {
      tag: "Announcements",
      title: "School Announcements",
      description: "Follow the latest announcements and school activities",
      important: "Important",
      empty: "No announcements available at the moment",
      loading: "Loading...",
    },
    fr: {
      tag: "Annonces",
      title: "Annonces scolaires",
      description: "Suivez les dernières annonces et activités scolaires",
      important: "Important",
      empty: "Aucune annonce disponible pour le moment",
      loading: "Chargement...",
    },
  };

  const content = pageContent[language as keyof typeof pageContent] || pageContent.en;

  return (
    <>
      <Helmet>
        <title>
          {t("nav", "announcements")} - {t("common", "siteName")}
        </title>
        <meta name="description" content={content.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-warm" dir={isRTL ? "rtl" : "ltr"}>
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
                    <span className="text-sm font-semibold">
                      {content.tag}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-charcoal">
                    {content.title}
                  </h1>
                </div>
              </div>
              <p className={`text-slate ${isRTL ? 'mr-6' : 'ml-6'}`}>{content.description}</p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal animate-spin" />
                <span className={`text-slate ${isRTL ? 'mr-3' : 'ml-3'}`}>{content.loading}</span>
              </div>
            )}

            {/* Announcements list */}
            {!loading && (
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement, index) => (
                    <div
                      key={announcement.id}
                      className="group bg-white rounded-2xl p-6 shadow-card border border-gray-100/80 flex items-start gap-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`p-3.5 rounded-xl transition-colors flex-shrink-0 ${announcement.urgent
                            ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                            : "bg-teal/10 group-hover:bg-teal/20 text-teal"
                          }`}
                      >
                        <Bell className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          {announcement.urgent && (
                            <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                              <Sparkles className="w-3 h-3" />
                              {content.important}
                            </span>
                          )}
                          <h3 className="font-bold text-charcoal group-hover:text-teal transition-colors text-start">
                            {announcement.title}
                          </h3>
                        </div>

                        {announcement.description && (
                          <p className="text-slate text-sm mb-2 text-start">
                            {announcement.description}
                          </p>
                        )}

                        {announcement.date && (
                          <span className="text-slate text-sm flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal/70" />
                            {announcement.date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-card">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-slate">{content.empty}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Announcements;
