import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Newspaper,
    X,
    Save,
    Lock,
    Shield
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { adminNews as initialNews, Article } from '@/data/mockData';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminNews = () => {
    const { hasPermission } = useAdmin();
    const { t, language } = useLanguage();
    const [news, setNews] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<Article | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'أخبار الإدارة',
        author: 'الإدارة',
        image: ''
    });
    const { toast } = useToast();

    // Fetch News
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await api.articles.getAll();
                // Filter for news categories if needed, or if backend doesn't filter.
                // Assuming 'أخبار الإدارة' is the category for "News" in this specific admin page context
                if (data) {
                    const newsItems = data.filter(item => item.category === 'أخبار الإدارة' || item.category === 'أخبار المؤسسة');
                    setNews(newsItems);
                }
            } catch (e) {
                console.error("Failed to load news", e);
                toast({ title: t('common', 'error'), description: 'Failed to load news', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Check if user can access news - only super_admin and editor
    if (!hasPermission('canManageNews')) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">{t('messages', 'notAllowed')}</h2>
                        <p className="text-slate">{t('users', 'editorPermissions')}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const filteredNews = news.filter(item =>
        item.title.includes(searchQuery) ||
        item.content?.includes(searchQuery)
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
        setEditingNews(null);
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category: 'أخبار الإدارة',
            author: 'الإدارة',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Article) => {
        if (!hasPermission('canEdit')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noEditPermission'),
                variant: 'destructive'
            });
            return;
        }
        setEditingNews(item);
        setFormData({
            title: item.title,
            excerpt: item.excerpt,
            content: item.content || '',
            category: item.category,
            author: item.author,
            image: item.image
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingNews) {
                await api.articles.update(editingNews.id, {
                    ...formData,
                    // keep original date
                });

                setNews(news.map(n =>
                    n.id === editingNews.id ? { ...n, ...formData } : n
                ));
                toast({ title: t('messages', 'updated'), description: t('news', 'newsUpdated') });
            } else {
                const newNewsItem = {
                    ...formData,
                    date: new Date().toISOString().split('T')[0],
                    featured: false
                };

                const created = await api.articles.create(newNewsItem);
                if (created) {
                    setNews([created, ...news]);
                    toast({ title: t('messages', 'added'), description: t('news', 'newsAdded') });
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
        if (confirm(t('news', 'confirmDelete'))) {
            try {
                await api.articles.delete(id);
                setNews(news.filter(n => n.id !== id));
                toast({ title: t('messages', 'deleted'), description: t('news', 'newsDeleted') });
            } catch (error) {
                console.error(error);
                toast({ title: t('common', 'error'), description: 'Delete failed', variant: 'destructive' });
            }
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('news', 'manageNews')} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="space-y-6">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-400/20 rounded-2xl">
                                <Newspaper className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-charcoal">{t('news', 'manageNews')}</h1>
                                <p className="text-slate mt-1.5">{t('news', 'addEditDeleteNews')}</p>
                            </div>
                        </div>
                        {hasPermission('canCreate') ? (
                            <button
                                onClick={openNewModal}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {t('news', 'addNews')}
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
                            placeholder={t('news', 'searchNews')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Enhanced News Table */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('articles', 'image')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('news', 'newsTitle')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('articles', 'author')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('articles', 'date')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredNews.map((item) => (
                                    <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-blue-400/5 transition-all duration-200 group">
                                        <td className="px-6 py-4">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-16 h-12 object-cover rounded-lg"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-charcoal text-sm line-clamp-1 max-w-xs">{item.title}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">{item.author}</td>
                                        <td className="px-6 py-4 text-sm text-slate">
                                            {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/article/${item.id}`}
                                                    target="_blank"
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title={t('common', 'view')}
                                                >
                                                    <Eye className="w-4 h-4 text-slate" />
                                                </a>
                                                {hasPermission('canEdit') && (
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title={t('common', 'edit')}
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                )}
                                                {hasPermission('canDelete') && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={t('common', 'delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredNews.length === 0 && (
                        <div className="text-center py-12">
                            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-slate">{t('news', 'noNews')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-charcoal">
                                {editingNews ? t('news', 'editNews') : t('news', 'addNews')}
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
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('news', 'newsTitle')}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'imageUrl')}</label>
                                <div className="flex gap-3">
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="flex-1 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                                        placeholder="https://..."
                                    />
                                    <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('news', 'summary')}</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('news', 'details')}</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={6}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingNews ? t('articles', 'saveChanges') : t('news', 'addNews')}
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

export default AdminNews;
