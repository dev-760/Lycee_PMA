import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Bell,
    X,
    Save,
    Sparkles,
    Lock,
    Shield,
    Clock
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { api } from '@/lib/api';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

/* Local type (no mockData) */
export interface Announcement {
    id: number;
    title: string;
    description?: string;
    urgent?: boolean;
    date: string;
}

const AdminAnnouncements = () => {
    const { hasPermission } = useAdmin();
    const { t, language } = useLanguage();
    const { toast } = useToast();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        urgent: false
    });

    /* Fetch announcements */
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.announcements.getAll();
                setAnnouncements(data || []);
            } catch (error) {
                console.error(error);
                toast({
                    title: t('common', 'error'),
                    description: 'Failed to load announcements',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    /* Permission guard */
    if (!hasPermission('canManageAnnouncements')) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">
                            {t('messages', 'notAllowed')}
                        </h2>
                        <p className="text-slate">
                            {t('users', 'administratorPermissions')}
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const filteredAnnouncements = announcements.filter(a =>
        a.title.includes(searchQuery)
    );

    const openNewModal = () => {
        if (!hasPermission('canCreate')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noAddPermission'),
                variant: 'destructive'
            });
            return;
        }

        setEditingAnnouncement(null);
        setFormData({ title: '', description: '', urgent: false });
        setIsModalOpen(true);
    };

    const openEditModal = (announcement: Announcement) => {
        if (!hasPermission('canEdit')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noEditPermission'),
                variant: 'destructive'
            });
            return;
        }

        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            description: announcement.description || '',
            urgent: announcement.urgent || false
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingAnnouncement) {
                await api.announcements.update(editingAnnouncement.id, formData);

                setAnnouncements(prev =>
                    prev.map(a =>
                        a.id === editingAnnouncement.id
                            ? { ...a, ...formData }
                            : a
                    )
                );

                toast({
                    title: t('messages', 'updated'),
                    description: t('announcements', 'announcementUpdated')
                });
            } else {
                const created = await api.announcements.create({
                    ...formData,
                    date: new Date().toLocaleDateString(
                        language === 'ar'
                            ? 'ar-MA'
                            : language === 'fr'
                            ? 'fr-FR'
                            : 'en-US',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                    )
                });

                if (created) {
                    setAnnouncements(prev => [created, ...prev]);
                }

                toast({
                    title: t('messages', 'added'),
                    description: t('announcements', 'announcementAdded')
                });
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast({
                title: t('common', 'error'),
                description: 'Operation failed',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!hasPermission('canDelete')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noDeletePermission'),
                variant: 'destructive'
            });
            return;
        }

        if (!confirm(t('announcements', 'confirmDelete'))) return;

        try {
            await api.announcements.delete(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            toast({
                title: t('messages', 'deleted'),
                description: t('announcements', 'announcementDeleted')
            });
        } catch (error) {
            console.error(error);
            toast({
                title: t('common', 'error'),
                description: 'Delete failed',
                variant: 'destructive'
            });
        }
    };

    const toggleUrgent = async (announcement: Announcement) => {
        if (!hasPermission('canEdit')) return;

        try {
            await api.announcements.update(announcement.id, {
                urgent: !announcement.urgent
            });

            setAnnouncements(prev =>
                prev.map(a =>
                    a.id === announcement.id
                        ? { ...a, urgent: !a.urgent }
                        : a
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>
                    {t('announcements', 'manageAnnouncements')} - {t('auth', 'controlPanel')}
                </title>
            </Helmet>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Bell className="w-8 h-8 text-gold" />
                    {t('announcements', 'manageAnnouncements')}
                </h1>

                {hasPermission('canCreate') ? (
                    <button
                        onClick={openNewModal}
                        className="bg-gold text-charcoal px-6 py-3 rounded-xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {t('announcements', 'addAnnouncement')}
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-slate">
                        <Lock className="w-4 h-4" />
                        {t('articles', 'viewOnlyMode')}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    className="w-full p-4 rounded-xl border"
                    placeholder={t('announcements', 'searchAnnouncements')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredAnnouncements.map(announcement => (
                    <div key={announcement.id} className="bg-white rounded-xl p-6 shadow border flex gap-4">
                        <div className={announcement.urgent ? 'text-red-600' : 'text-gold'}>
                            <Bell />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold">{announcement.title}</h3>
                            {announcement.description && (
                                <p className="text-sm text-slate mt-1">{announcement.description}</p>
                            )}
                            <p className="text-xs text-slate flex items-center gap-1 mt-2">
                                <Clock className="w-3 h-3" />
                                {announcement.date}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {hasPermission('canEdit') && (
                                <>
                                    <button onClick={() => toggleUrgent(announcement)}>
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openEditModal(announcement)}>
                                        <Edit2 className="w-4 h-4 text-gold" />
                                    </button>
                                </>
                            )}
                            {hasPermission('canDelete') && (
                                <button onClick={() => handleDelete(announcement.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4"
                    >
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold">
                                {editingAnnouncement
                                    ? t('announcements', 'editAnnouncement')
                                    : t('announcements', 'addAnnouncement')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X />
                            </button>
                        </div>

                        <input
                            required
                            className="w-full p-3 border rounded"
                            placeholder={t('announcements', 'announcementText')}
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />

                        <textarea
                            className="w-full p-3 border rounded"
                            rows={4}
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.urgent}
                                onChange={(e) =>
                                    setFormData({ ...formData, urgent: e.target.checked })
                                }
                            />
                            {t('announcements', 'urgent')}
                        </label>

                        <button
                            type="submit"
                            className="bg-gold w-full py-3 rounded-xl font-bold"
                        >
                            <Save className="inline w-4 h-4 mr-2" />
                            {t('common', 'save')}
                        </button>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminAnnouncements;
