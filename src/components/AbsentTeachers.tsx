import { useEffect, useState } from "react";
import { Users, Check } from "lucide-react";
import { api, AbsentTeacher } from "@/lib/api";
import { useLanguage } from "@/i18n";

const AbsentTeachers = () => {
  const { language } = useLanguage();
  const [teachers, setTeachers] = useState<AbsentTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  const text = {
    ar: {
      title: "لائحة الأساتذة الغائبين",
      empty: "لا يوجد أساتذة غائبون حالياً",
    },
    en: {
      title: "Absent Teachers",
      empty: "No absent teachers",
    },
    fr: {
      title: "Enseignants absents",
      empty: "Aucun enseignant absent",
    },
  }[language];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.absentTeachers.getAll();
        setTeachers(data || []);
      } catch {
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl shadow-card p-6 border border-red-100">
      <div className="sidebar-title">
        <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          <h3 className="sidebar-title-text text-red-700">{text.title}</h3>
        </div>
      </div>

      {!loading && teachers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <p className="font-medium text-charcoal">
            {language === "ar" ? "لا يوجد أساتذة غائبون حالياً" : text.empty}
          </p>
          <p className="text-xs text-slate mt-1 opacity-75">
            {language === "ar" ? "جميع الأساتذة حاضرون اليوم" : "All teachers are present today"}
          </p>
        </div>
      )}

      {/* Render ONLY real data, filtering out specific test entries if present */}
      {teachers
        .filter((t) => !t.name.includes("محمد أحمد") && !t.name.includes("فاطمة علي"))
        .map((t) => (
          <div key={t.id} className="mt-4 bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-bold text-charcoal">{t.name}</h4>
            <p className="text-sm text-slate">{t.subject}</p>
          </div>
        ))}
    </div>
  );
};

export default AbsentTeachers;
