import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AbsentTeacher } from '@/components/AbsentTeachers';
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
  X,
  Check,
  Shield
} from 'lucide-react';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/admin/components/Layout';

/* Helpers */
const isWeekend = (date: string) => {
  const d = new Date(date).getDay();
  return d === 0 || d === 6;
};

const calculateDays = (from: string, to: string) => {
  const start = new Date(from);
  const end = new Date(to);
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  return diff < 1 ? 1 : diff;
};

const formatDuration = (days: number, lang: string) => {
  if (lang === 'fr') return days === 1 ? '1 jour' : `${days} jours`;
  if (lang === 'ar') return days === 1 ? 'يوم واحد' : `${days} أيام`;
  return days === 1 ? '1 day' : `${days} days`;
};

const AbsentTeachersAdmin = () => {
  const { hasPermission } = useAdmin();
  const { language, isRTL, t: tGlobal } = useLanguage();
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<AbsentTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AbsentTeacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    note: ''
  });

  const translations = {
    en: {
      title: 'Manage Absent Teachers',
      search: 'Search teachers...',
      add: 'Add Teacher',
      save: 'Save',
      cancel: 'Cancel',
      name: 'Teacher Name',
      subject: 'Subject',
      from: 'From',
      to: 'To',
      duration: 'Duration',
      note: 'Note',
      noTeachers: 'No absent teachers found',
      weekendError: 'Weekends are not allowed',
      dateError: 'End date must be after or equal to start date',
      deleteConfirm: 'Are you sure you want to delete this entry?',
      deleted: 'Teacher removed',
      saved: 'Teacher saved',
      notAllowed: 'Access Denied'
    },
    fr: {
      title: 'Gérer les Enseignants Absents',
      search: 'Rechercher...',
      add: 'Ajouter',
      save: 'Enregistrer',
      cancel: 'Annuler',
      name: 'Nom de l\'enseignant',
      subject: 'Matière',
      from: 'Du',
      to: 'Au',
      duration: 'Durée',
      note: 'Note',
      noTeachers: 'Aucun enseignant absent trouvé',
      weekendError: 'Les week-ends ne sont pas autorisés',
      dateError: 'La date de fin doit être après la date de début',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette entrée?',
      deleted: 'Enseignant supprimé',
      saved: 'Enseignant enregistré',
      notAllowed: 'Accès refusé'
    },
    ar: {
      title: 'إدارة الأساتذة الغائبين',
      search: 'بحث...',
      add: 'إضافة أستاذ',
      save: 'حفظ',
      cancel: 'إلغاء',
      name: 'اسم الأستاذ',
      subject: 'المادة',
      from: 'من',
      to: 'إلى',
      duration: 'المدة',
      note: 'ملاحظة',
      noTeachers: 'لا يوجد أساتذة غائبين',
      weekendError: 'لا يمكن اختيار عطلة نهاية الأسبوع',
      dateError: 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية',
      deleteConfirm: 'هل أنت متأكد من حذف هذا السجل؟',
      deleted: 'تم حذف الأستاذ',
      saved: 'تم حفظ الأستاذ',
      notAllowed: 'غير مسموح'
    }
  };

  const t = translations[language as keyof typeof translations] ?? translations.en;

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await api.absentTeachers.getAll();
        setTeachers(data || []);
      } catch (e) {
        console.error("Failed to load absent teachers", e);
        toast({
          title: 'Error',
          description: 'Failed to load absent teachers',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Permission check - uses canManageAnnouncements since absent teachers is an admin function
  const canEdit = hasPermission('canManageAnnouncements');

  if (!canEdit) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-charcoal mb-2">{t.notAllowed}</h2>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateDates = () => {
    if (formData.dateTo < formData.dateFrom) {
      setError(t.dateError);
      return false;
    }
    if (isWeekend(formData.dateFrom) || isWeekend(formData.dateTo)) {
      setError(t.weekendError);
      return false;
    }
    setError('');
    return true;
  };

  const openNewModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      subject: '',
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      note: ''
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (teacher: AbsentTeacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      subject: teacher.subject || '',
      dateFrom: teacher.dateFrom,
      dateTo: teacher.dateTo,
      note: teacher.note || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    const days = calculateDays(formData.dateFrom, formData.dateTo);
    const duration = formatDuration(days, language);

    try {
      if (editingTeacher) {
        const updated = await api.absentTeachers.update(editingTeacher.id, {
          ...formData,
          duration
        });

        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? updated : t));
      } else {
        const created = await api.absentTeachers.create({
          ...formData,
          duration
        });

        setTeachers(prev => [...prev, created]);
      }

      toast({ title: t.saved });
      setShowModal(false);
      setEditingTeacher(null);
    } catch (err) {
      console.error("Error saving teacher", err);
      setError("Error saving teacher");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      await api.absentTeachers.delete(id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      toast({ title: t.deleted });
    } catch (err) {
      console.error("Error deleting teacher", err);
      toast({
        title: 'Error',
        description: 'Failed to delete',
        variant: 'destructive'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-red-500" />
            {t.title}
          </h1>

          <button
            onClick={openNewModal}
            className="bg-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t.add}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            placeholder={t.search}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
          />
        </div>

        {/* Teachers List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-start font-semibold text-charcoal">{t.name}</th>
                <th className="p-4 text-start font-semibold text-charcoal">{t.subject}</th>
                <th className="p-4 text-start font-semibold text-charcoal">{t.from}</th>
                <th className="p-4 text-start font-semibold text-charcoal">{t.to}</th>
                <th className="p-4 text-start font-semibold text-charcoal">{t.duration}</th>
                <th className="p-4 text-start font-semibold text-charcoal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-charcoal">{teacher.name}</td>
                  <td className="p-4 text-slate">{teacher.subject}</td>
                  <td className="p-4 text-slate">{teacher.dateFrom}</td>
                  <td className="p-4 text-slate">{teacher.dateTo}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      {teacher.duration}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-slate" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-slate">{t.noTeachers}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl w-full max-w-lg space-y-5"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-charcoal">
                {editingTeacher ? 'Edit Teacher' : t.add}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">{t.name}</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">{t.subject}</label>
              <input
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">{t.from}</label>
                <input
                  type="date"
                  required
                  value={formData.dateFrom}
                  onChange={e => setFormData({ ...formData, dateFrom: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">{t.to}</label>
                <input
                  type="date"
                  required
                  value={formData.dateTo}
                  min={formData.dateFrom}
                  onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <span className="text-sm text-slate">{t.duration}: </span>
              <span className="font-bold text-red-600">
                {formatDuration(calculateDays(formData.dateFrom, formData.dateTo), language)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">{t.note}</label>
              <textarea
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t.save}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-8 py-4 rounded-xl border border-gray-200 text-slate font-medium hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};

export default AbsentTeachersAdmin;
