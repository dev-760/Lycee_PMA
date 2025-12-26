/**
 * Admin Announcements Page
 * 
 * Example implementation of multilingual content management.
 * - Admin writes content in one language (source_language)
 * - Translations are generated automatically on create/update
 * - Frontend displays content based on selected language
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { Announcement, Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types';
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
    Clock,
    Link as LinkIcon,
    FileText,
    ExternalLink,
    Globe,
    Loader2,
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminAnnouncements = () => {
    const { hasPermission } = useAdmin();
    const { t, language, isRTL, getContent, getContentWithFallback } = useLanguage();
    const { toast } = useToast();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // Form data with source language selection
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        urgent: false,
        link_url: '',
        link_text: '',
        source_language: 'ar' as Language,
    });

    // Fetch Announcements
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
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    // Permission check
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

    // Filter announcements based on search (searches in current language)
    const filteredAnnouncements = announcements.filter((a) => {
        const title = getContentWithFallback(a.title_translations, a.title);
        const description = getContentWithFallback(a.description_translations, a.description || '');
        return (
            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const openNewModal = () => {
        if (!hasPermission('canCreate')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noAddPermission'),
                variant: 'destructive',
            });
            return;
        }

        setEditingAnnouncement(null);
        setFormData({
            title: '',
            description: '',
            urgent: false,
            link_url: '',
            link_text: '',
            source_language: language, // Default to current UI language
        });
        setIsModalOpen(true);
    };

    const openEditModal = (announcement: Announcement) => {
        if (!hasPermission('canEdit')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noEditPermission'),
                variant: 'destructive',
            });
            return;
        }

        setEditingAnnouncement(announcement);
        // Load content in source language for editing
        const sourceLang = announcement.source_language || 'ar';
        setFormData({
            title: announcement.title_translations?.[sourceLang] || announcement.title,
            description: announcement.description_translations?.[sourceLang] || announcement.description || '',
            urgent: announcement.urgent || false,
            link_url: announcement.link_url || '',
            link_text: announcement.link_text || '',
            source_language: sourceLang,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingAnnouncement) {
                // Update with re-translation
                const updated = await api.announcements.update(
                    editingAnnouncement.id,
                    {
                        title: formData.title,
                        description: formData.description,
                        urgent: formData.urgent,
                        link_url: formData.link_url,
                        link_text: formData.link_text,
                    },
                    formData.source_language,
                    true // retranslate
                );

                setAnnouncements((prev) =>
                    prev.map((a) => (a.id === editingAnnouncement.id ? updated : a))
                );

                toast({
                    title: t('messages', 'updated'),
                    description: t('announcements', 'announcementUpdated'),
                });
            } else {
                // Create with automatic translation
                const created = await api.announcements.create(
                    {
                        title: formData.title,
                        description: formData.description,
                        urgent: formData.urgent,
                        link_url: formData.link_url,
                        link_text: formData.link_text,
                    },
                    formData.source_language
                );

                setAnnouncements((prev) => [created, ...prev]);
                toast({
                    title: t('messages', 'added'),
                    description: t('announcements', 'announcementAdded'),
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast({
                title: t('common', 'error'),
                description: 'Operation failed',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!hasPermission('canDelete')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noDeletePermission'),
                variant: 'destructive',
            });
            return;
        }

        if (!confirm(t('announcements', 'confirmDelete'))) return;

        try {
            await api.announcements.delete(id);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            toast({
                title: t('messages', 'deleted'),
                description: t('announcements', 'announcementDeleted'),
            });
        } catch (error) {
            console.error(error);
            toast({
                title: t('common', 'error'),
                description: 'Delete failed',
                variant: 'destructive',
            });
        }
    };

    const toggleUrgent = async (id: number) => {
        if (!hasPermission('canEdit')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noEditPermission'),
                variant: 'destructive',
            });
            return;
        }

        const announcement = announcements.find((a) => a.id === id);
        if (!announcement) return;

        try {
            const newState = !announcement.urgent;
            await api.announcements.update(
                id,
                { urgent: newState },
                announcement.source_language,
                false // Don't retranslate for simple toggle
            );
            setAnnouncements((prev) =>
                prev.map((a) => (a.id === id ? { ...a, urgent: newState } : a))
            );
        } catch (error) {
            console.error(error);
            toast({
                title: t('common', 'error'),
                description: 'Update failed',
                variant: 'destructive',
            });
        }
    };

    // Local translations for form labels
    const localT: Record<string, Record<Language, string>> = {
        documentLink: { ar: 'رابط المستند', en: 'Document Link', fr: 'Lien du document' },
        linkUrl: { ar: 'رابط المستند (URL)', en: 'Document URL', fr: 'URL du document' },
        linkText: { ar: 'نص الرابط', en: 'Link Text', fr: 'Texte du lien' },
        linkPlaceholder: { ar: 'https://drive.google.com/...', en: 'https://drive.google.com/...', fr: 'https://drive.google.com/...' },
        linkTextPlaceholder: { ar: 'اضغط لتحميل المستند', en: 'Click to download document', fr: 'Cliquez pour télécharger le document' },
        writeIn: { ar: 'كتابة المحتوى بـ', en: 'Write content in', fr: 'Écrire le contenu en' },
        autoTranslate: { ar: 'سيتم الترجمة تلقائياً', en: 'Will be translated automatically', fr: 'Sera traduit automatiquement' },
        translating: { ar: 'جاري الحفظ والترجمة...', en: 'Saving and translating...', fr: 'Enregistrement et traduction...' },
        descriptionLabel: { ar: 'الوصف (اختياري)', en: 'Description (optional)', fr: 'Description (optionnel)' },
        descriptionPlaceholder: { ar: 'أضف وصفاً للإعلان (اختياري)', en: 'Add a description (optional)', fr: 'Ajouter une description (optionnel)' },
    };

    const getLocal = (key: string) => localT[key]?.[language] || localT[key]?.en || key;

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('announcements', 'manageAnnouncements')} - {t('auth', 'controlPanel')}</title>
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
                        className="bg-gradient-to-r from-gold to-gold-light text-charcoal px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
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
                <Search className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <input
                    className={`w-full p-4 ${isRTL ? 'pl-12' : 'pr-12'} rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none`}
                    placeholder={t('announcements', 'searchAnnouncements')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 text-gold mx-auto mb-4 animate-spin" />
                        <p className="text-slate">Loading...</p>
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-card border border-gray-100 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-slate">{t('announcements', 'noAnnouncements')}</p>
                    </div>
                ) : (
                    filteredAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-5 hover:shadow-xl hover:border-gold/30 transition-all duration-300"
                        >
                            <div
                                className={`p-3.5 rounded-xl flex-shrink-0 ${announcement.urgent
                                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                        : 'bg-gold/10 text-gold'
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                    {announcement.urgent && (
                                        <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md animate-pulse">
                                            <Sparkles className="w-3 h-3" />
                                            {t('announcements', 'important')}
                                        </span>
                                    )}
                                    {/* Display title in current language */}
                                    <h3 className="font-bold text-charcoal text-lg">
                                        {getContentWithFallback(announcement.title_translations, announcement.title)}
                                    </h3>
                                </div>

                                {/* Display description in current language */}
                                {(announcement.description_translations || announcement.description) && (
                                    <p className="text-sm text-slate mb-2 line-clamp-2">
                                        {getContentWithFallback(announcement.description_translations, announcement.description || '')}
                                    </p>
                                )}

                                {/* Document Link */}
                                {announcement.link_url && (
                                    <a
                                        href={announcement.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-teal hover:text-gold transition-colors mb-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        {announcement.link_text || getLocal('documentLink')}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}

                                <div className="flex items-center gap-3 text-xs text-slate">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {announcement.date}
                                    </span>
                                    {/* Show source language indicator */}
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
                                        <Globe className="w-3 h-3" />
                                        {LANGUAGE_NAMES[announcement.source_language]}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {hasPermission('canEdit') && (
                                    <>
                                        <button
                                            onClick={() => toggleUrgent(announcement.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${announcement.urgent
                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    : 'bg-gray-100 text-slate hover:bg-gray-200'
                                                }`}
                                        >
                                            {announcement.urgent
                                                ? t('announcements', 'removeImportance')
                                                : t('announcements', 'setAsImportant')}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(announcement)}
                                            className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-gold" />
                                        </button>
                                    </>
                                )}
                                {hasPermission('canDelete') && (
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-2xl w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-charcoal">
                                {editingAnnouncement
                                    ? t('announcements', 'editAnnouncement')
                                    : t('announcements', 'addAnnouncement')}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate" />
                            </button>
                        </div>

                        {/* Source Language Selection */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-charcoal">{getLocal('writeIn')}</span>
                            </div>
                            <div className="flex gap-2">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, source_language: lang })}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${formData.source_language === lang
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-slate hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        {LANGUAGE_NAMES[lang]}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate mt-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {getLocal('autoTranslate')}
                            </p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                {t('announcements', 'announcementText')}
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                                placeholder={t('announcements', 'announcementText')}
                                required
                                dir={formData.source_language === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                {getLocal('descriptionLabel')}
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none"
                                placeholder={getLocal('descriptionPlaceholder')}
                                rows={4}
                                dir={formData.source_language === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {/* Document Link Section */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-charcoal font-medium">
                                <LinkIcon className="w-4 h-4" />
                                {getLocal('documentLink')}
                            </div>
                            <div>
                                <label className="block text-sm text-slate mb-1">{getLocal('linkUrl')}</label>
                                <input
                                    type="url"
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none text-sm"
                                    placeholder={getLocal('linkPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate mb-1">{getLocal('linkText')}</label>
                                <input
                                    type="text"
                                    value={formData.link_text}
                                    onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none text-sm"
                                    placeholder={getLocal('linkTextPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Urgent Toggle */}
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

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-gradient-to-r from-gold to-gold-light text-charcoal py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {getLocal('translating')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {editingAnnouncement
                                            ? t('articles', 'saveChanges')
                                            : t('announcements', 'addAnnouncement')}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={saving}
                                className="px-8 py-4 rounded-xl border border-gray-200 text-slate font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {t('common', 'cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminAnnouncements;
