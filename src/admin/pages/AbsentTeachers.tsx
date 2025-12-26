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
  X,
  Check
} from 'lucide-react';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import AdminLayout from '@/admin/components/Layout';
import { api, AbsentTeacher } from '@/lib/api';

/* 🔹 Helpers */
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
  const { language, isRTL } = useLanguage();
  const [teachers, setTeachers] = useState<AbsentTeacher[]>([]);
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
      search: 'Search...',
      add: 'Add Teacher',
      save: 'Save',
      cancel: 'Cancel',
      weekendError: 'Weekends are not allowed',
      dateError: 'End date must be after or equal to start date'
    },
    fr: {
      title: 'Gérer les Enseignants Absents',
      search: 'Rechercher...',
      add: 'Ajouter',
      save: 'Enregistrer',
      cancel: 'Annuler',
      weekendError: 'Les week-ends ne sont pas autorisés',
      dateError: 'La date de fin doit être après la date de début'
    },
    ar: {
      title: 'إدارة الأساتذة الغائبين',
      search: 'بحث...',
      add: 'إضافة',
      save: 'حفظ',
      cancel: 'إلغاء',
      weekendError: 'لا يمكن اختيار عطلة نهاية الأسبوع',
      dateError: 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية'
    }
  };

  const t = translations[language as keyof typeof translations] ?? translations.en;

  useEffect(() => {
    /* Fetch from API */
    api.absentTeachers.getAll().then(setTeachers).catch(console.error);
  }, []);

  const canEdit = hasPermission('canManageAnnouncements');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    const days = calculateDays(formData.dateFrom, formData.dateTo);
    const duration = formatDuration(days, language);

    // Format for display/storage
    const from = new Date(formData.dateFrom).toLocaleDateString('fr-FR');
    const to = new Date(formData.dateTo).toLocaleDateString('fr-FR');

    try {
      if (editingTeacher) {
        await api.absentTeachers.update(editingTeacher.id, {
          name: formData.name,
          subject: formData.subject,
          from,
          to,
          duration,
          note: formData.note
        });
      } else {
        await api.absentTeachers.create({
          name: formData.name,
          subject: formData.subject,
          from,
          to,
          duration,
          note: formData.note
        });
      }

      // Refresh list
      const data = await api.absentTeachers.getAll();
      setTeachers(data);
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({
        name: '',
        subject: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        note: ''
      });
    } catch (e) {
      console.error(e);
      setError('Failed to save');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t.title}</h1>

        <input
          placeholder={t.search}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-xl"
        />

        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-xl"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            {t.add}
          </button>
        )}

        {showModal && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl space-y-4 max-w-md">
            {error && (
              <div className="text-red-600 bg-red-50 p-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            <input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full p-3 border rounded-xl"
            />

            <input
              type="date"
              required
              value={formData.dateFrom}
              onChange={e => setFormData({ ...formData, dateFrom: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />

            <input
              type="date"
              required
              value={formData.dateTo}
              min={formData.dateFrom}
              onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />

            <div className="text-sm bg-gray-100 p-3 rounded-xl">
              {formatDuration(
                calculateDays(formData.dateFrom, formData.dateTo),
                language
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-red-500 text-white py-2 rounded-xl">
                {t.save}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded-xl"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AbsentTeachersAdmin;
