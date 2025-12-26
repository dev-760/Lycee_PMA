import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { Article } from '@/types';
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
    Shield,
    Upload
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminArticles = () => {
    const { hasPermission, currentUser } = useAdmin();
    const { t, tNested, language } = useLanguage();
    const { toast } = useToast();

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

    // Fetch articles
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await api.articles.getAll();
                setArticles(data || []);
            } catch (error) {
                console.error(error);
                toast({
                    title: t('common', 'error'),
                    description: 'Failed to load articles',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    // Permission check
    if (!hasPermission('canManageArticles')) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">
                            {t('messages', 'notAllowed')}
                        </h2>
                        <p className="text-slate">
                            {t('users', 'editorPermissions')}
                        </p>
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
            image: ''
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
                await api.articles.update(editingArticle.id, formData);

                setArticles(prev =>
                    prev.map(a =>
                        a.id === editingArticle.id ? { ...a, ...formData } : a
                    )
                );

                toast({
                    title: t('messages', 'updated'),
                    description: t('articles', 'articleUpdated')
                });
            } else {
                const created = await api.articles.create({
                    ...formData,
                    date: new Date().toISOString().split('T')[0],
                    featured: false
                });

                if (created) {
                    setArticles(prev => [created, ...prev]);
                }

                toast({
                    title: t('messages', 'added'),
                    description: t('articles', 'articleAdded')
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

        if (!confirm(t('articles', 'confirmDelete'))) return;

        try {
            await api.articles.delete(id);
            setArticles(prev => prev.filter(a => a.id !== id));
            toast({
                title: t('messages', 'deleted'),
                description: t('articles', 'articleDeleted')
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

    return (
        <AdminLayout>
            <Helmet>
                <title>
                    {t('articles', 'manageArticles')} - {t('auth', 'controlPanel')}
                </title>
            </Helmet>

            {/* Page header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FileText className="w-8 h-8 text-teal" />
                    {t('articles', 'manageArticles')}
                </h1>

                {hasPermission('canCreate') ? (
                    <button
                        onClick={openNewModal}
                        className="bg-teal text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-teal/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        {t('articles', 'addArticle')}
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
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    placeholder={t('articles', 'searchArticles')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'image')}</th>
                            <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'articleTitle')}</th>
                            <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'author')}</th>
                            <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'category')}</th>
                            <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'date')}</th>
                            <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    {article.image ? (
                                        <img src={article.image} alt={article.title} className="w-16 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 font-medium text-charcoal">{article.title}</td>
                                <td className="p-4 text-slate">{article.author}</td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-teal/10 text-teal text-xs font-medium rounded-full">
                                        {article.category}
                                    </span>
                                </td>
                                <td className="p-4 text-slate">{article.date}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/article/${article.id}`}
                                            target="_blank"
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4 text-slate" />
                                        </a>
                                        {hasPermission('canEdit') && (
                                            <button
                                                onClick={() => openEditModal(article)}
                                                className="p-2 hover:bg-teal/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 text-teal" />
                                            </button>
                                        )}
                                        {hasPermission('canDelete') && (
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
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

                {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-slate">{t('articles', 'noArticles')}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-2xl w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-charcoal">
                                {editingArticle ? t('articles', 'editArticle') : t('articles', 'addArticle')}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'articleTitle')}</label>
                            <input
                                required
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                placeholder={t('articles', 'articleTitle')}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'author')}</label>
                                <input
                                    required
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'category')}</label>
                                <select
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value={tNested('articles', 'categories.articles')}>{tNested('articles', 'categories.articles')}</option>
                                    <option value={tNested('articles', 'categories.institutionNews')}>{tNested('articles', 'categories.institutionNews')}</option>
                                    <option value={tNested('articles', 'categories.creativity')}>{tNested('articles', 'categories.creativity')}</option>
                                    <option value={tNested('articles', 'categories.sports')}>{tNested('articles', 'categories.sports')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'imageUrl')}</label>
                            <input
                                type="url"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                placeholder="https://..."
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                            {formData.image && (
                                <img src={formData.image} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'excerpt')}</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                                placeholder={t('articles', 'excerpt')}
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'content')}</label>
                            <textarea
                                rows={6}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                                placeholder={t('articles', 'content')}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
            )}
        </AdminLayout>
    );
};

export default AdminArticles;
