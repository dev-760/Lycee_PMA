import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Search,
    Calendar,
    Clock,
    AlertCircle,
    BookOpen,
    GraduationCap,
    X,
    Check
} from 'lucide-react';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import AdminLayout from '@/admin/components/Layout';
import { AbsentTeacher, getAbsentTeachers, saveAbsentTeachers } from '@/components/AbsentTeachers';

const AbsentTeachersAdmin = () => {
    const { hasPermission } = useAdmin();
    const { language, isRTL } = useLanguage();
    const [teachers, setTeachers] = useState<AbsentTeacher[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<AbsentTeacher | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        duration: '',
        note: ''
    });

    const content = {
        ar: {
            title: 'إدارة لائحة الأساتذة الغائبين',
            subtitle: 'إضافة وتعديل وحذف بيانات الأساتذة الغائبين',
            addTeacher: 'إضافة أستاذ غائب',
            editTeacher: 'تعديل بيانات الأستاذ',
            search: 'بحث في الأساتذة...',
            fullName: 'الاسم الكامل',
            subject: 'المادة',
            dateFrom: 'من',
            dateTo: 'إلى',
            duration: 'المدة',
            note: 'ملاحظة',
            actions: 'الإجراءات',
            save: 'حفظ',
            cancel: 'إلغاء',
            delete: 'حذف',
            confirmDelete: 'هل أنت متأكد من حذف هذا الأستاذ؟',
            noTeachers: 'لا يوجد أساتذة غائبون',
            added: 'تم إضافة الأستاذ بنجاح',
            updated: 'تم تحديث البيانات بنجاح',
            deleted: 'تم حذف الأستاذ بنجاح',
            viewOnly: 'وضع العرض فقط',
            viewOnlyNotice: 'ليس لديك صلاحية لتعديل هذه البيانات',
            enterName: 'أدخل اسم الأستاذ',
            enterSubject: 'أدخل المادة',
            enterDuration: 'أدخل المدة',
            enterNote: 'أدخل ملاحظة (اختياري)',
            subjects: {
                math: 'الرياضيات',
                physics: 'الفيزياء',
                chemistry: 'الكيمياء',
                biology: 'علوم الحياة والأرض',
                arabic: 'اللغة العربية',
                french: 'اللغة الفرنسية',
                english: 'اللغة الإنجليزية',
                history: 'التاريخ والجغرافيا',
                islamic: 'التربية الإسلامية',
                philosophy: 'الفلسفة',
                sports: 'التربية البدنية',
                informatics: 'المعلوميات',
            },
            durations: {
                oneSession: 'حصة واحدة',
                twoSessions: 'حصتان',
                halfDay: 'نصف يوم',
                oneDay: 'يوم واحد',
                twoDays: 'يومان',
                week: 'أسبوع',
            }
        },
        en: {
            title: 'Manage Absent Teachers',
            subtitle: 'Add, edit and delete absent teachers data',
            addTeacher: 'Add Absent Teacher',
            editTeacher: 'Edit Teacher Data',
            search: 'Search teachers...',
            fullName: 'Full Name',
            subject: 'Subject',
            dateFrom: 'From',
            dateTo: 'To',
            duration: 'Duration',
            note: 'Note',
            actions: 'Actions',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            confirmDelete: 'Are you sure you want to delete this teacher?',
            noTeachers: 'No absent teachers',
            added: 'Teacher added successfully',
            updated: 'Data updated successfully',
            deleted: 'Teacher deleted successfully',
            viewOnly: 'View Only Mode',
            viewOnlyNotice: 'You do not have permission to modify this data',
            enterName: 'Enter teacher name',
            enterSubject: 'Enter subject',
            enterDuration: 'Enter duration',
            enterNote: 'Enter note (optional)',
            subjects: {
                math: 'Mathematics',
                physics: 'Physics',
                chemistry: 'Chemistry',
                biology: 'Biology',
                arabic: 'Arabic',
                french: 'French',
                english: 'English',
                history: 'History & Geography',
                islamic: 'Islamic Education',
                philosophy: 'Philosophy',
                sports: 'Physical Education',
                informatics: 'Computer Science',
            },
            durations: {
                oneSession: 'One Session',
                twoSessions: 'Two Sessions',
                halfDay: 'Half Day',
                oneDay: 'One Day',
                twoDays: 'Two Days',
                week: 'One Week',
            }
        },
        fr: {
            title: 'Gérer les Enseignants Absents',
            subtitle: 'Ajouter, modifier et supprimer les données des enseignants absents',
            addTeacher: 'Ajouter un Enseignant Absent',
            editTeacher: "Modifier les Données de l'Enseignant",
            search: 'Rechercher des enseignants...',
            fullName: 'Nom Complet',
            subject: 'Matière',
            dateFrom: 'Du',
            dateTo: 'Au',
            duration: 'Durée',
            note: 'Remarque',
            actions: 'Actions',
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer',
            confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet enseignant?',
            noTeachers: 'Aucun enseignant absent',
            added: 'Enseignant ajouté avec succès',
            updated: 'Données mises à jour avec succès',
            deleted: 'Enseignant supprimé avec succès',
            viewOnly: 'Mode Lecture Seule',
            viewOnlyNotice: "Vous n'avez pas la permission de modifier ces données",
            enterName: "Entrez le nom de l'enseignant",
            enterSubject: 'Entrez la matière',
            enterDuration: 'Entrez la durée',
            enterNote: 'Entrez une remarque (optionnel)',
            subjects: {
                math: 'Mathématiques',
                physics: 'Physique',
                chemistry: 'Chimie',
                biology: 'Sciences de la Vie et de la Terre',
                arabic: 'Arabe',
                french: 'Français',
                english: 'Anglais',
                history: 'Histoire-Géographie',
                islamic: 'Éducation Islamique',
                philosophy: 'Philosophie',
                sports: 'Éducation Physique',
                informatics: 'Informatique',
            },
            durations: {
                oneSession: 'Une Séance',
                twoSessions: 'Deux Séances',
                halfDay: 'Demi-journée',
                oneDay: 'Un Jour',
                twoDays: 'Deux Jours',
                week: 'Une Semaine',
            }
        }
    };

    const t = content[language];

    // Load teachers on mount
    useEffect(() => {
        setTeachers(getAbsentTeachers());
    }, []);

    // Filter teachers based on search
    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canEdit = hasPermission('canManageAnnouncements'); // Administrator role

    const resetForm = () => {
        setFormData({
            name: '',
            subject: '',
            dateFrom: new Date().toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
            duration: '',
            note: ''
        });
        setEditingTeacher(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (teacher: AbsentTeacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            subject: teacher.subject,
            dateFrom: teacher.dateFrom.split('/').reverse().join('-'), // Convert DD/MM/YYYY to YYYY-MM-DD
            dateTo: teacher.dateTo.split('/').reverse().join('-'), // Convert DD/MM/YYYY to YYYY-MM-DD
            duration: teacher.duration,
            note: teacher.note || ''
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dateFromFormatted = new Date(formData.dateFrom).toLocaleDateString('fr-FR');
        const dateToFormatted = new Date(formData.dateTo).toLocaleDateString('fr-FR');

        if (editingTeacher) {
            // Update existing
            const updatedTeachers = teachers.map(t =>
                t.id === editingTeacher.id
                    ? { ...t, ...formData, dateFrom: dateFromFormatted, dateTo: dateToFormatted }
                    : t
            );
            setTeachers(updatedTeachers);
            saveAbsentTeachers(updatedTeachers);
        } else {
            // Add new
            const newTeacher: AbsentTeacher = {
                id: Date.now().toString(),
                ...formData,
                dateFrom: dateFromFormatted,
                dateTo: dateToFormatted
            };
            const updatedTeachers = [...teachers, newTeacher];
            setTeachers(updatedTeachers);
            saveAbsentTeachers(updatedTeachers);
        }

        setShowModal(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        const updatedTeachers = teachers.filter(t => t.id !== id);
        setTeachers(updatedTeachers);
        saveAbsentTeachers(updatedTeachers);
        setDeleteConfirm(null);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            {t.title}
                        </h1>
                        <p className="text-slate mt-1">{t.subtitle}</p>
                    </div>

                    {canEdit && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5" />
                            {t.addTeacher}
                        </button>
                    )}
                </div>

                {/* View Only Notice */}
                {!canEdit && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="font-medium text-amber-700">{t.viewOnly}</p>
                            <p className="text-sm text-amber-600">{t.viewOnlyNotice}</p>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <input
                        type="text"
                        placeholder={t.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full py-3 border border-gray-200 rounded-xl bg-white text-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                    />
                </div>

                {/* Teachers List */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    {filteredTeachers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                            <p className="text-slate">{t.noTeachers}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-red-500" />
                                                {t.fullName}
                                            </div>
                                        </th>
                                        <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-red-500" />
                                                {t.subject}
                                            </div>
                                        </th>
                                        <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-red-500" />
                                                {t.dateFrom}
                                            </div>
                                        </th>
                                        <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-red-500" />
                                                {t.dateTo}
                                            </div>
                                        </th>
                                        <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-red-500" />
                                                {t.duration}
                                            </div>
                                        </th>
                                        <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.note}
                                        </th>
                                        {canEdit && (
                                            <th className={`py-4 px-4 font-semibold text-charcoal ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {t.actions}
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeachers.map((teacher, index) => (
                                        <tr
                                            key={teacher.id}
                                            className={`hover:bg-gray-50 transition-colors ${index !== filteredTeachers.length - 1 ? 'border-b border-gray-100' : ''
                                                }`}
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <span className="font-medium text-charcoal">{teacher.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate">{teacher.subject}</td>
                                            <td className="py-4 px-4 text-slate">{teacher.dateFrom}</td>
                                            <td className="py-4 px-4 text-slate">{teacher.dateTo}</td>
                                            <td className="py-4 px-4">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                                                    {teacher.duration}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate">{teacher.note || '—'}</td>
                                            {canEdit && (
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(teacher)}
                                                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                                                            title={t.editTeacher}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        {deleteConfirm === teacher.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleDelete(teacher.id)}
                                                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirm(teacher.id)}
                                                                className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                                                                title={t.delete}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-charcoal">
                                        {editingTeacher ? t.editTeacher : t.addTeacher}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        {t.fullName} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={t.enterName}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        {t.subject} *
                                    </label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="">{t.enterSubject}</option>
                                        {Object.entries(t.subjects).map(([key, value]) => (
                                            <option key={key} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        {t.dateFrom} *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateFrom}
                                        onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        {t.dateTo} *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateTo}
                                        onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        {t.duration} *
                                    </label>
                                    <select
                                        required
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="">{t.enterDuration}</option>
                                        {Object.entries(t.durations).map(([key, value]) => (
                                            <option key={key} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">
                                        {t.note}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        placeholder={t.enterNote}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all font-medium"
                                    >
                                        {t.save}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 py-3 bg-gray-100 text-charcoal rounded-xl hover:bg-gray-200 transition-all font-medium"
                                    >
                                        {t.cancel}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AbsentTeachersAdmin;
