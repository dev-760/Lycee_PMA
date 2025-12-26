import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/i18n";

interface AbsentTeacher {
  id: number;
  name: string;
  subject: string;
  from: string;
  to: string;
  duration: string;
  note?: string;
}

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
          <h3 className="sidebar-title-text text-red-700">
            {text.title}
          </h3>
        </div>
      </div>

      {!loading && teachers.length === 0 && (
        <p className="text-sm text-slate mt-4">
          {text.empty}
        </p>
      )}

      {/* Render ONLY real data */}
      {teachers.map((t) => (
        <div key={t.id} className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-bold text-charcoal">{t.name}</h4>
          <p className="text-sm text-slate">{t.subject}</p>
        </div>
      ))}
    </div>
  );
};

export default AbsentTeachers;
