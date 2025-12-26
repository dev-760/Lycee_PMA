import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
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
import { announcements as initialAnnouncements, Announcement } from '@/data/mockData';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminAnnouncements = () => {
    const { hasPermission } = useAdmin();
    const { t, language } = useLanguage();
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
    const { toast } = useToast();

    // Fetch Announcements
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.announcements.getAll();
                if (data) setAnnouncements(data);
            } catch (e) {
                console.error("Failed to load announcements", e);
                toast({ title: t('common', 'error'), description: 'Failed to load announcements', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    // Check if user can access announcements - only super_admin and administrator
    if (!hasPermission('canManageAnnouncements')) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">{t('messages', 'notAllowed')}</h2>
                        <p className="text-slate">{t('users', 'administratorPermissions')}</p>
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
            description: (announcement as any).description || '',
            urgent: announcement.urgent || false
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingAnnouncement) {
                await api.announcements.update(editingAnnouncement.id, {
                    ...formData,
                    // keep original date
                });

                // Optimistic or refetch
                setAnnouncements(announcements.map(a =>
                    a.id === editingAnnouncement.id ? { ...a, ...formData } : a
                ));
                toast({ title: t('messages', 'updated'), description: t('announcements', 'announcementUpdated') });
            } else {
                const newAnnouncement = {
                    ...formData,
                    date: new Date().toISOString().split('T')[0]
                };
                const created = await api.announcements.create(newAnnouncement);
                if (created) {
                    setAnnouncements([created, ...announcements]);
                    toast({ title: t('messages', 'added'), description: t('announcements', 'announcementAdded') });
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: t('common', 'error'), description: 'Operation failed', variant: 'destructive' });
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
        if (confirm(t('announcements', 'confirmDelete'))) {
            try {
                await api.announcements.delete(id);
                setAnnouncements(announcements.filter(a => a.id !== id));
                toast({ title: t('messages', 'deleted'), description: t('announcements', 'announcementDeleted') });
            } catch (error) {
                console.error(error);
                toast({ title: t('common', 'error'), description: 'Delete failed', variant: 'destructive' });
            }
        }
    };

    const toggleUrgent = async (id: number) => {
        if (!hasPermission('canEdit')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noEditPermission'),
                variant: 'destructive'
            });
            return;
        }

        const announcement = announcements.find(a => a.id === id);
        if (!announcement) return;

        try {
            const newState = !announcement.urgent;
            await api.announcements.update(id, { urgent: newState });
            setAnnouncements(announcements.map(a =>
                a.id === id ? { ...a, urgent: newState } : a
            ));
        } catch (error) {
            console.error(error);
            toast({ title: t('common', 'error'), description: 'Update failed', variant: 'destructive' });
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('announcements', 'manageAnnouncements')} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="space-y-6">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-gold/20 to-gold-light/20 rounded-2xl">
                                <Bell className="w-8 h-8 text-gold" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-charcoal">{t('announcements', 'manageAnnouncements')}</h1>
                                <p className="text-slate mt-1.5">{t('announcements', 'addEditDeleteAnnouncements')}</p>
                            </div>
                        </div>
                        {hasPermission('canCreate') ? (
                            <button
                                onClick={openNewModal}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-charcoal px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-gold/30 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {t('announcements', 'addAnnouncement')}
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 bg-gray-100 text-slate px-6 py-3 rounded-xl font-medium">
                                <Lock className="w-4 h-4" />
                                {t('articles', 'viewOnlyMode')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Permission Notice for Viewers */}
                {!hasPermission('canEdit') && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-600" />
                        <p className="text-sm text-amber-800">
                            {t('articles', 'viewOnlyNotice')}
                        </p>
                    </div>
                )}

                {/* Search */}
                <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('announcements', 'searchAnnouncements')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Enhanced Announcements List */}
                <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 flex items-center gap-5 hover:shadow-xl hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className={`p-3.5 rounded-xl ${announcement.urgent
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                : 'bg-gold/10 text-gold'
                                }`}>
                                <Bell className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {announcement.urgent && (
                                        <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md animate-pulse">
                                            <Sparkles className="w-3 h-3" />
                                            {t('announcements', 'important')}
                                        </span>
                                    )}
                                    <h3 className="font-bold text-charcoal text-lg group-hover:text-gold transition-colors">{announcement.title}</h3>
                                </div>
                                {(announcement as any).description && (
                                    <p className="text-sm text-slate mb-2 line-clamp-2">{(announcement as any).description}</p>
                                )}
                                <p className="text-xs text-slate flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(announcement.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {hasPermission('canEdit') && (
                                    <>
                                        <button
                                            onClick={() => toggleUrgent(announcement.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${announcement.urgent
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                : 'bg-gray-100 text-slate hover:bg-gray-200'
                                                }`}
                                        >
                                            {announcement.urgent ? t('announcements', 'removeImportance') : t('announcements', 'setAsImportant')}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(announcement)}
                                            className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                                            title={t('common', 'edit')}
                                        >
                                            <Edit2 className="w-4 h-4 text-gold" />
                                        </button>
                                    </>
                                )}
                                {hasPermission('canDelete') && (
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title={t('common', 'delete')}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredAnnouncements.length === 0 && (
                        <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-slate">{t('announcements', 'noAnnouncements')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-charcoal">
                                {editingAnnouncement ? t('announcements', 'editAnnouncement') : t('announcements', 'addAnnouncement')}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('announcements', 'announcementText')}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                                    placeholder={t('announcements', 'announcementText')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    {language === 'ar' ? 'الوصف (اختياري)' : language === 'fr' ? 'Description (optionnel)' : 'Description (optional)'}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none"
                                    placeholder={language === 'ar' ? 'أضف وصفاً للإعلان (اختياري)' : language === 'fr' ? 'Ajouter une description (optionnel)' : 'Add a description (optional)'}
                                    rows={4}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="urgent"
                                    checked={formData.urgent}
                                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="urgent" className="flex-1">
                                    <span className="font-medium text-charcoal">{t('announcements', 'urgent')}</span>
                                    <p className="text-xs text-slate mt-0.5">{t('announcements', 'urgentDescription')}</p>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-gold to-gold-light text-charcoal py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingAnnouncement ? t('articles', 'saveChanges') : t('announcements', 'addAnnouncement')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 rounded-xl border border-gray-200 text-slate font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('common', 'cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminAnnouncements;
