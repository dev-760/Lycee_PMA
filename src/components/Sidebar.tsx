import { useEffect, useState } from "react";
import { Bell, Sparkles, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n";
import { api } from "@/lib/api";
import AbsentTeachers from "./AbsentTeachers";

interface Announcement {
  id: number;
  title: string;
  date: string;
  urgent?: boolean;
}

interface SidebarProps {
  position: "left" | "right";
}

const Sidebar = ({ position }: SidebarProps) => {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    ar: {
      schoolAnnouncements: "إعلانات المدرسة",
      important: "هام",
      stayInformed: "ابقَ على اطلاع",
      stayInformedDesc: "تابع آخر أخبار المؤسسة والإعلانات الجديدة",
      contactUs: "تواصل معنا",
      empty: "لا توجد إعلانات حالياً",
    },
    en: {
      schoolAnnouncements: "School Announcements",
      important: "Important",
      stayInformed: "Stay Informed",
      stayInformedDesc: "Follow the latest news and announcements",
      contactUs: "Contact Us",
      empty: "No announcements available",
    },
    fr: {
      schoolAnnouncements: "Annonces scolaires",
      important: "Important",
      stayInformed: "Restez informé",
      stayInformedDesc: "Suivez les dernières annonces de l'institution",
      contactUs: "Contactez-nous",
      empty: "Aucune annonce disponible",
    },
  };

  const t = content[language];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.announcements.getAll();
        setAnnouncements(data || []);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (position === "right") {
    return (
      <aside className="space-y-6">
        {/* Announcements */}
        <div className="sidebar-section">
          <div className="sidebar-title">
            <div className="sidebar-title-bar" />
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal" />
              <h3 className="sidebar-title-text">
                {t.schoolAnnouncements}
              </h3>
            </div>
          </div>

          <ul className="space-y-3">
            {!loading && announcements.length === 0 && (
              <li className="text-sm text-slate px-4 py-2">
                {t.empty}
              </li>
            )}

            {announcements.map((a) => (
              <li
                key={a.id}
                className="p-4 rounded-xl hover:bg-white/5 transition"
              >
                <div className="flex items-start gap-3">
                  {a.urgent && (
                    <span className="flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {t.important}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-charcoal">
                      {a.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate mt-1">
                      <Calendar className="w-3 h-3" />
                      {a.date}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  // Position === "left" (or default)
  return (
    <aside className="space-y-6">
      <AbsentTeachers />

      {/* Contact box */}
      <div className="rounded-2xl shadow-card bg-gradient-to-br from-navy to-navy-light p-6 text-white">
        <h3 className="font-bold text-lg mb-2">{t.stayInformed}</h3>
        <p className="text-sm mb-4">{t.stayInformedDesc}</p>
        <a
          href="/contact"
          className="block text-center bg-gold text-black font-semibold py-3 rounded-xl hover:bg-gold-light transition-colors"
        >
          {t.contactUs}
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
