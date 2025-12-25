import { Users, Calendar, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n";

export interface AbsentTeacher {
    id: string;
    name: string;
    subject: string;
    dateFrom: string;
    dateTo: string;
    duration: string;
    note?: string;
}

// Storage key for absent teachers data
const STORAGE_KEY = 'absentTeachersData';

// Get absent teachers from localStorage
export const getAbsentTeachers = (): AbsentTeacher[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return getDefaultAbsentTeachers();
        }
    }
    return getDefaultAbsentTeachers();
};

// Save absent teachers to localStorage
export const saveAbsentTeachers = (teachers: AbsentTeacher[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
};

// Default data
const getDefaultAbsentTeachers = (): AbsentTeacher[] => [
    {
        id: '1',
        name: "محمد أحمد",
        subject: "الرياضيات",
        dateFrom: new Date().toLocaleDateString('fr-FR'),
        dateTo: new Date(Date.now() + 86400000).toLocaleDateString('fr-FR'),
        duration: "يوم واحد",
        note: "سبب صحي",
    },
    {
        id: '2',
        name: "فاطمة علي",
        subject: "اللغة الفرنسية",
        dateFrom: new Date().toLocaleDateString('fr-FR'),
        dateTo: new Date(Date.now() + 172800000).toLocaleDateString('fr-FR'),
        duration: "حصتان",
    },
];

// Initialize default data if not exists
if (!localStorage.getItem(STORAGE_KEY)) {
    saveAbsentTeachers(getDefaultAbsentTeachers());
}

const AbsentTeachers = () => {
    const { language, isRTL } = useLanguage();
    const absentTeachers = getAbsentTeachers();

    const content = {
        ar: {
            title: 'لائحة الأساتذة الغائبين',
            fullName: 'الاسم الكامل',
            subject: 'المادة',
            dateFrom: 'من',
            dateTo: 'إلى',
            duration: 'المدة',
            note: 'ملاحظة',
            lastUpdate: 'آخر تحيين',
            noAbsences: 'لا يوجد أساتذة غائبون حالياً',
        },
        en: {
            title: 'Absent Teachers List',
            fullName: 'Full Name',
            subject: 'Subject',
            dateFrom: 'From',
            dateTo: 'To',
            duration: 'Duration',
            note: 'Note',
            lastUpdate: 'Last Update',
            noAbsences: 'No absent teachers currently',
        },
        fr: {
            title: 'Liste des Enseignants Absents',
            fullName: 'Nom Complet',
            subject: 'Matière',
            dateFrom: 'Du',
            dateTo: 'Au',
            duration: 'Durée',
            note: 'Remarque',
            lastUpdate: 'Dernière mise à jour',
            noAbsences: 'Aucun enseignant absent actuellement',
        },
    };

    const t = content[language];

    return (
        <div className="space-y-6">
            {/* Absent Teachers Section */}
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl shadow-card p-6 border border-red-100">
                <div className="sidebar-title">
                    <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-500" />
                        <h3 className="sidebar-title-text text-red-700">{t.title}</h3>
                    </div>
                </div>

                {absentTeachers.length === 0 ? (
                    <div className="text-center py-8 text-slate">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{t.noAbsences}</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards View */}
                        <div className="lg:hidden space-y-3">
                            {absentTeachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-charcoal">{teacher.name}</h4>
                                                <p className="text-sm text-slate">{teacher.subject}</p>
                                            </div>
                                        </div>
                                        {teacher.note && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                                {teacher.note}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-1 text-slate">
                                            <Calendar className="w-3 h-3" />
                                            <span className="font-medium">{t.dateFrom}:</span>
                                            <span>{teacher.dateFrom}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate">
                                            <Calendar className="w-3 h-3" />
                                            <span className="font-medium">{t.dateTo}:</span>
                                            <span>{teacher.dateTo}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate col-span-2">
                                            <Clock className="w-3 h-3" />
                                            <span>{teacher.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-red-100">
                                        <th className={`py-3 px-2 font-bold text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.fullName}
                                        </th>
                                        <th className={`py-3 px-2 font-bold text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.subject}
                                        </th>
                                        <th className={`py-3 px-2 font-bold text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.dateFrom}
                                        </th>
                                        <th className={`py-3 px-2 font-bold text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.dateTo}
                                        </th>
                                        <th className={`py-3 px-2 font-bold text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.duration}
                                        </th>
                                        <th className={`py-3 px-2 font-bold text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.note}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {absentTeachers.map((teacher, index) => (
                                        <tr
                                            key={teacher.id}
                                            className={`hover:bg-white/80 transition-colors ${index !== absentTeachers.length - 1 ? 'border-b border-red-50' : ''
                                                }`}
                                        >
                                            <td className="py-3 px-2 font-medium text-charcoal">{teacher.name}</td>
                                            <td className="py-3 px-2 text-slate">{teacher.subject}</td>
                                            <td className="py-3 px-2 text-slate">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {teacher.dateFrom}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-slate">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {teacher.dateTo}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-slate">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {teacher.duration}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                {teacher.note ? (
                                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                                        {teacher.note}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <div className="mt-4 pt-3 border-t border-red-100 flex items-center gap-2 text-xs text-slate">
                    <Clock className="w-3 h-3" />
                    <span>🔄 {t.lastUpdate}: {new Date().toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
        </div>
    );
};

export default AbsentTeachers;
