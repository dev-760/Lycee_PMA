import { Bell, TrendingUp, Sparkles, Calendar } from "lucide-react";
import { announcements } from "@/data/mockData";
import { useLanguage } from "@/i18n";
import AbsentTeachers from "./AbsentTeachers";

interface SidebarProps {
  position: "left" | "right";
}

const Sidebar = ({ position }: SidebarProps) => {
  const { language } = useLanguage();

  // Translations for sidebar
  const content = {
    ar: {
      schoolAnnouncements: 'إعلانات المدرسة',
      important: 'هام',
      adminNews: 'أخبار الإدارة',
      examDate: 'موعد الامتحانات',
      examDesc: 'تنطلق الامتحانات الموحدة للفصل الأول يوم 15 يناير 2025',
      supportProgram: 'برنامج الدعم',
      supportDesc: 'حصص الدعم متاحة كل يوم سبت من 9 صباحاً حتى 12 ظهراً',
      generalCulture: 'ثقافة عامة',
      dailyTip: 'نصيحة اليوم',
      tipText: 'القراءة غذاء العقل، فاحرص على تخصيص وقت يومي للمطالعة والتعلم.',
      wisdom: 'حكمة اليوم',
      stayInformed: 'ابقَ على اطلاع',
      stayInformedDesc: 'تابع آخر أخبار المؤسسة والإعلانات الجديدة',
      contactUs: 'تواصل معنا',
    },
    en: {
      schoolAnnouncements: 'School Announcements',
      important: 'Important',
      adminNews: 'Administration News',
      examDate: 'Exam Schedule',
      examDesc: 'First semester unified exams begin on January 15, 2025',
      supportProgram: 'Support Program',
      supportDesc: 'Support sessions available every Saturday from 9 AM to 12 PM',
      generalCulture: 'General Knowledge',
      dailyTip: 'Tip of the Day',
      tipText: 'Reading feeds the mind. Make sure to allocate daily time for reading and learning.',
      wisdom: 'Daily Wisdom',
      stayInformed: 'Stay Informed',
      stayInformedDesc: 'Follow the latest news and announcements from the institution',
      contactUs: 'Contact Us',
    },
    fr: {
      schoolAnnouncements: 'Annonces scolaires',
      important: 'Important',
      adminNews: 'Actualités de l\'administration',
      examDate: 'Date des examens',
      examDesc: 'Les examens unifiés du premier semestre débutent le 15 janvier 2025',
      supportProgram: 'Programme de soutien',
      supportDesc: 'Séances de soutien disponibles chaque samedi de 9h à 12h',
      generalCulture: 'Culture générale',
      dailyTip: 'Conseil du jour',
      tipText: 'La lecture nourrit l\'esprit. Consacrez du temps quotidien à la lecture et à l\'apprentissage.',
      wisdom: 'Sagesse du jour',
      stayInformed: 'Restez informé',
      stayInformedDesc: 'Suivez les dernières nouvelles et annonces de l\'institution',
      contactUs: 'Contactez-nous',
    },
  };

  const t = content[language];

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
            {announcements.map((announcement, index) => (
              <li
                key={announcement.id}
                className={`group p-4 rounded-xl transition-all duration-300 hover:bg-gray-50 cursor-pointer ${index !== announcements.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  {announcement.urgent && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold mt-0.5 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      {t.important}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal text-sm leading-relaxed group-hover:text-teal transition-colors">
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

        {/* Administration News */}
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal"></div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>

          <div className="relative p-6 text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-teal/20">
                <TrendingUp className="w-5 h-5 text-teal-light" />
              </div>
              <h3 className="font-bold text-lg">{t.adminNews}</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <h4 className="font-bold mb-2 text-teal-light text-sm">{t.examDate}</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {t.examDesc}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <h4 className="font-bold mb-2 text-gold-light text-sm">{t.supportProgram}</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {t.supportDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      {/* Absent Teachers List */}
      <AbsentTeachers />

      {/* Newsletter / Subscribe Box */}
      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-light to-teal"></div>
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-lg">{t.stayInformed}</h3>
          </div>
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            {t.stayInformedDesc}
          </p>
          <a
            href="/contact"
            className="block text-center px-5 py-3 bg-white text-teal font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            {t.contactUs}
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
