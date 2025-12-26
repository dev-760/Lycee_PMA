import { useEffect, useState } from "react";
import { Bell, TrendingUp, Sparkles, Calendar } from "lucide-react";
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

  // Translations
  const content = {
    ar: {
      schoolAnnouncements: "إعلانات المدرسة",
      important: "هام",
      adminNews: "أخبار الإدارة",
      examDate: "موعد الامتحانات",
      examDesc: "تنطلق الامتحانات الموحدة للفصل الأول يوم 15 يناير 2025",
      supportProgram: "برنامج الدعم",
      supportDesc: "حصص الدعم متاحة كل يوم سبت من 9 صباحاً حتى 12 ظهراً",
      stayInformed: "ابقَ على اطلاع",
      stayInformedDesc: "تابع آخر أخبار المؤسسة والإعلانات الجديدة",
      contactUs: "تواصل معنا",
    },
    en: {
      schoolAnnouncements: "School Announcements",
      important: "Important",
      adminNews: "Administration News",
      examDate: "Exam Schedule",
      examDesc: "First semester unified exams begin on January 15, 2025",
      supportProgram: "Support Program",
      supportDesc: "Support sessions available every Saturday from 9 AM to 12 PM",
      stayInformed: "Stay Informed",
      stayInformedDesc: "Follow the latest news and announcements from the institution",
      contactUs: "Contact Us",
    },
    fr: {
      schoolAnnouncements: "Annonces scolaires",
      important: "Important",
      adminNews: "Actualités de l'administration",
      examDate: "Date des examens",
      examDesc: "Les examens unifiés du premier semestre débutent le 15 janvier 2025",
      supportProgram: "Programme de soutien",
      supportDesc: "Séances de soutien disponibles chaque samedi de 9h à 12h",
      stayInformed: "Restez informé",
      stayInformedDesc: "Suivez les dernières nouvelles et annonces de l'institution",
      contactUs: "Contactez-nous",
    },
  };

  const t = content[language];

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.announcements.getAll();
        if (data) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Failed to load announcements", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (position === "left") {
    return (
      <aside className="space-y-6">
        {/* School Announcements */}
        <div className="sidebar-section">
          <div className="sidebar-title">
            <div className="sidebar-title-bar" />
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal" />
              <h3 className="sidebar-title-text">{t.schoolAnnouncements}</h3>
            </div>
          </div>

          <ul className="space-y-3">
            {!loading && announcements.length === 0 && (
              <li className="text-sm text-slate px-4 py-2">
                —
              </li>
            )}

            {announcements.map((announcement, index) => (
              <li
                key={announcement.id}
                className={`group p-4 rounded-xl transition-all hover:bg-gray-50 ${
                  index !== announcements.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {announcement.urgent && (
                    <span className="flex items-center gap-1 bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                      <Sparkles className="w-3 h-3" />
                      {t.important}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal text-sm group-hover:text-teal transition-colors">
                      {announcement.title}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-slate text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Administration News (static info) */}
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal" />
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-5 h-5 text-teal-light" />
              <h3 className="font-bold text-lg">{t.adminNews}</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-bold mb-2 text-teal-light text-sm">{t.examDate}</h4>
                <p className="text-sm text-white/80">{t.examDesc}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-bold mb-2 text-gold-light text-sm">{t.supportProgram}</h4>
                <p className="text-sm text-white/80">{t.supportDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Right sidebar
  return (
    <aside className="space-y-6">
      <AbsentTeachers />

      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-light to-teal" />
        <div className="relative p-6 text-white">
          <h3 className="font-bold text-lg mb-2">{t.stayInformed}</h3>
          <p className="text-sm mb-4">{t.stayInformedDesc}</p>
          <a
            href="/contact"
            className="block text-center px-5 py-3 bg-white text-teal font-semibold rounded-xl"
          >
            {t.contactUs}
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
