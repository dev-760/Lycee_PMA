import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    FileText,
    X,
    Save,
    Lock,
    Shield
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { articles as initialArticles, Article } from '@/data/mockData';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminArticles = () => {
    const { hasPermission, currentUser } = useAdmin();
    const { t, tNested, language } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'مقالات',
        author: '',
        image: ''
    });
    const { toast } = useToast();

    // Fetch Articles
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await api.articles.getAll();
                // Filter only 'articles' category types if needed, 
                // but this page seems to manage 'articles' broadly (except maybe 'news').
                // The mock data logic used 'initialArticles' which contained only Articles.
                // Let's filter by categories relevant to Articles
                if (data) {
                    const articleCategories = ['مقالات', 'Articles', 'إبداعات', 'Creativity', 'رياضة', 'Sports'];
                    // Or just filter OUT admin news if the other page handles it?
                    // Let's assume this page handles everything that is NOT admin news? 
                    // Actually the select box allows 'adminNews'. So maybe it handles ALL?
                    // If it handles all, we just set data.
                    setArticles(data);
                }
            } catch (e) {
                console.error("Failed to load articles", e);
                toast({ title: t('common', 'error'), description: 'Failed to load articles', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    // Check if user can access articles - only super_admin and editor
    if (!hasPermission('canManageArticles')) {
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

    const filteredArticles = articles.filter(article =>
        article.title.includes(searchQuery) ||
        article.author.includes(searchQuery) ||
        article.category.includes(searchQuery)
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
        setEditingArticle(null);
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category: tNested('articles', 'categories.articles'),
            author: currentUser?.name || '',
            image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&fit=crop'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (article: Article) => {
        if (!hasPermission('canEdit')) {
            toast({
                title: t('messages', 'notAllowed'),
                description: t('messages', 'noEditPermission'),
                variant: 'destructive'
            });
            return;
        }
        setEditingArticle(article);
        setFormData({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content || '',
            category: article.category,
            author: article.author,
            image: article.image
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingArticle) {
                // Update
                // formData does not contain date, so we just use formData

                await api.articles.update(editingArticle.id, {
                    ...formData,
                    // keep original date
                });

                // Optimistic update or refetch
                setArticles(articles.map(a => a.id === editingArticle.id ? { ...a, ...formData } : a));
                toast({ title: t('messages', 'updated'), description: t('articles', 'articleUpdated') });
            } else {
                // Create
                const newArticleData = {
                    ...formData,
                    date: new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                    featured: false
                };

                const created = await api.articles.create(newArticleData);
                if (created) {
                    setArticles([created, ...articles]);
                    toast({ title: t('messages', 'added'), description: t('articles', 'articleAdded') });
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
        if (confirm(t('articles', 'confirmDelete'))) {
            try {
                await api.articles.delete(id);
                setArticles(articles.filter(a => a.id !== id));
                toast({ title: t('messages', 'deleted'), description: t('articles', 'articleDeleted') });
            } catch (error) {
                console.error(error);
                toast({ title: t('common', 'error'), description: 'Delete failed', variant: 'destructive' });
            }
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('articles', 'manageArticles')} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal flex items-center gap-3">
                            <FileText className="w-8 h-8 text-teal" />
                            {t('articles', 'manageArticles')}
                        </h1>
                        <p className="text-slate mt-1">{t('articles', 'addEditDelete')}</p>
                    </div>
                    {hasPermission('canCreate') ? (
                        <button
                            onClick={openNewModal}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal to-teal-light text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-teal/30 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            {t('articles', 'addArticle')}
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-gray-100 text-slate px-6 py-3 rounded-xl font-medium">
                            <Lock className="w-4 h-4" />
                            {t('articles', 'viewOnlyMode')}
                        </div>
                    )}
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
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
                        <input
                            type="text"
                            placeholder={t('articles', 'searchArticles')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'image')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'articleTitle')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'author')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'category')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'date')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-16 h-12 object-cover rounded-lg"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-charcoal text-sm line-clamp-1 max-w-xs">{article.title}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">{article.author}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-teal/10 text-teal text-xs font-medium rounded-full">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">{article.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/article/${article.id}`}
                                                    target="_blank"
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title={t('common', 'view')}
                                                >
                                                    <Eye className="w-4 h-4 text-slate" />
                                                </a>
                                                {hasPermission('canEdit') && (
                                                    <button
                                                        onClick={() => openEditModal(article)}
                                                        className="p-2 hover:bg-teal/10 rounded-lg transition-colors"
                                                        title={t('common', 'edit')}
                                                    >
                                                        <Edit2 className="w-4 h-4 text-teal" />
                                                    </button>
                                                )}
                                                {hasPermission('canDelete') && (
                                                    <button
                                                        onClick={() => handleDelete(article.id)}
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

                    {filteredArticles.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-slate">{t('articles', 'noArticles')}</p>
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
                                {editingArticle ? t('articles', 'editArticle') : t('articles', 'addArticle')}
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
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'articleTitle')}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'author')}</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'category')}</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    >
                                        <option value={tNested('articles', 'categories.articles')}>{tNested('articles', 'categories.articles')}</option>
                                        <option value={tNested('articles', 'categories.institutionNews')}>{tNested('articles', 'categories.institutionNews')}</option>
                                        <option value={tNested('articles', 'categories.creativity')}>{tNested('articles', 'categories.creativity')}</option>
                                        <option value={tNested('articles', 'categories.sports')}>{tNested('articles', 'categories.sports')}</option>
                                        <option value={tNested('articles', 'categories.adminNews')}>{tNested('articles', 'categories.adminNews')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'imageUrl')}</label>
                                <div className="flex gap-3">
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="flex-1 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                        placeholder="https://..."
                                    />
                                    <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'excerpt')}</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'content')}</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={6}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-teal to-teal-light text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingArticle ? t('articles', 'saveChanges') : t('articles', 'addArticle')}
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

export default AdminArticles;
