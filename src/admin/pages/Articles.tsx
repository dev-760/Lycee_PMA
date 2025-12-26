import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { api } from '@/lib/api';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

/* Local Article type (no mockData) */
export interface Article {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    category: string;
    author: string;
    image: string;
    date: string;
}

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
        category: tNested('articles', 'categories.articles'),
        author: '',
        image: ''
    });

    /* Fetch articles */
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

    /* Permission check */
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
                    date: new Date().toLocaleDateString(
                        language === 'ar'
                            ? 'ar-MA'
                            : language === 'fr'
                            ? 'fr-FR'
                            : 'en-US',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                    ),
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
                        className="bg-teal text-white px-6 py-3 rounded-xl flex items-center gap-2"
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
            <div className="mb-4 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    className="w-full p-4 rounded-xl border"
                    placeholder={t('articles', 'searchArticles')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-start">{t('articles', 'image')}</th>
                            <th className="p-4 text-start">{t('articles', 'articleTitle')}</th>
                            <th className="p-4">{t('articles', 'author')}</th>
                            <th className="p-4">{t('articles', 'category')}</th>
                            <th className="p-4">{t('articles', 'date')}</th>
                            <th className="p-4">{t('articles', 'actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.map(article => (
                            <tr key={article.id} className="border-t">
                                <td className="p-4">
                                    <img src={article.image} className="w-16 h-12 rounded object-cover" />
                                </td>
                                <td className="p-4 font-medium">{article.title}</td>
                                <td className="p-4">{article.author}</td>
                                <td className="p-4">{article.category}</td>
                                <td className="p-4">{article.date}</td>
                                <td className="p-4 flex gap-2">
                                    <a href={`/article/${article.id}`} target="_blank">
                                        <Eye className="w-4 h-4" />
                                    </a>
                                    {hasPermission('canEdit') && (
                                        <button onClick={() => openEditModal(article)}>
                                            <Edit2 className="w-4 h-4 text-teal" />
                                        </button>
                                    )}
                                    {hasPermission('canDelete') && (
                                        <button onClick={() => handleDelete(article.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredArticles.length === 0 && (
                    <p className="text-center py-10 text-slate">
                        {t('articles', 'noArticles')}
                    </p>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-xl w-full max-w-2xl space-y-4"
                    >
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold">
                                {editingArticle
                                    ? t('articles', 'editArticle')
                                    : t('articles', 'addArticle')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X />
                            </button>
                        </div>

                        <input
                            required
                            className="w-full p-3 border rounded"
                            placeholder={t('articles', 'articleTitle')}
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />

                        <textarea
                            required
                            className="w-full p-3 border rounded"
                            placeholder={t('articles', 'excerpt')}
                            value={formData.excerpt}
                            onChange={(e) =>
                                setFormData({ ...formData, excerpt: e.target.value })
                            }
                        />

                        <textarea
                            className="w-full p-3 border rounded"
                            rows={6}
                            placeholder={t('articles', 'content')}
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({ ...formData, content: e.target.value })
                            }
                        />

                        <button
                            type="submit"
                            className="bg-teal text-white w-full py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {t('common', 'save')}
                        </button>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminArticles;
