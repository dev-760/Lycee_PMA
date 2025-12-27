/**
 * Admin Articles Page
 * 
 * Manages articles with multilingual support.
 * - Admin can select source language when creating content
 * - Translations are generated automatically on save
 * - Displays content in user's selected language
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { Article, Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/types';
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
    Globe,
    Sparkles,
    Loader2,
    Image as ImageIcon,
    Video,
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import RichTextEditor from '@/admin/components/RichTextEditor';
import MediaUploader from '@/admin/components/MediaUploader';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminArticles = () => {
    const { hasPermission, currentUser } = useAdmin();
    const { t, tNested, language, isRTL, getContentWithFallback } = useLanguage();
    const { toast } = useToast();

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'مقالات',
        author: '',
        images: [] as string[],
        videos: [] as string[],
        source_language: 'ar' as Language,
    });

    // Fetch articles
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await api.articles.getAll();
                // Filter out news categories to show only articles
                const articlesOnly = (data || []).filter((item: Article) =>
                    !['أخبار المؤسسة', 'أخبار الإدارة', 'Institution News', 'Administration News'].includes(item.category)
                );
                setArticles(articlesOnly);
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

    // Filter articles based on search (searches in current language)
    const filteredArticles = articles.filter(article => {
        const title = getContentWithFallback(article.title_translations, article.title);
        return (
            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

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
            images: [],
            videos: [],
            source_language: language, // Default to current UI language
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
        // Load content in source language for editing
        const sourceLang = article.source_language || 'ar';

        // Build images array from legacy image + new images array
        const allImages: string[] = [];
        if (article.image) allImages.push(article.image);
        if (article.images && article.images.length > 0) {
            // Add any images not already in the array
            article.images.forEach(img => {
                if (!allImages.includes(img)) allImages.push(img);
            });
        }

        setFormData({
            title: article.title_translations?.[sourceLang] || article.title,
            excerpt: article.excerpt_translations?.[sourceLang] || article.excerpt,
            content: article.content_translations?.[sourceLang] || article.content || '',
            category: article.category,
            author: article.author,
            images: allImages,
            videos: article.videos || [],
            source_language: sourceLang,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Use the first image as the main image for backward compatibility
            const mainImage = formData.images[0] || '';

            if (editingArticle) {
                // Update with re-translation
                const updated = await api.articles.update(
                    editingArticle.id,
                    {
                        title: formData.title,
                        excerpt: formData.excerpt,
                        content: formData.content,
                        category: formData.category,
                        author: formData.author,
                        image: mainImage,
                        images: formData.images,
                        videos: formData.videos,
                    },
                    formData.source_language,
                    true // retranslate
                );

                setArticles(prev =>
                    prev.map(a => a.id === editingArticle.id ? updated : a)
                );

                toast({
                    title: t('messages', 'updated'),
                    description: t('articles', 'articleUpdated')
                });
            } else {
                // Create with automatic translation
                const created = await api.articles.create(
                    {
                        title: formData.title,
                        excerpt: formData.excerpt,
                        content: formData.content,
                        category: formData.category,
                        author: formData.author,
                        image: mainImage,
                        images: formData.images,
                        videos: formData.videos,
                        featured: false,
                    },
                    formData.source_language
                );

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
        } finally {
            setSaving(false);
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

    // Local translations
    const localT: Record<string, Record<Language, string>> = {
        writeIn: { ar: 'كتابة المحتوى بـ', en: 'Write content in', fr: 'Écrire le contenu en' },
        autoTranslate: { ar: 'سيتم الترجمة تلقائياً', en: 'Will be translated automatically', fr: 'Sera traduit automatiquement' },
        translating: { ar: 'جاري الحفظ والترجمة...', en: 'Saving and translating...', fr: 'Enregistrement et traduction...' },
        articleImage: { ar: 'صورة المقال', en: 'Article Image', fr: "Image de l'article" },
        clickUpload: { ar: 'اضغط لرفع صورة', en: 'Click to upload image', fr: 'Cliquez pour télécharger' },
        uploading: { ar: 'جاري الرفع...', en: 'Uploading...', fr: 'Téléchargement...' },
        orEnterUrl: { ar: 'أو أدخل رابط الصورة', en: 'Or enter image URL', fr: "Ou entrez l'URL de l'image" },
        writeContent: { ar: 'اكتب محتوى المقال هنا...', en: 'Write article content here...', fr: "Écrivez le contenu de l'article ici..." },
    };

    const getLocal = (key: string) => localT[key]?.[language] || localT[key]?.en || key;

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
                <Search className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <input
                    className={`w-full p-4 ${isRTL ? 'pl-12' : 'pr-12'} rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none`}
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
                                        <img src={article.image} alt={getContentWithFallback(article.title_translations, article.title)} className="w-16 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {/* Display title in user's selected language */}
                                    <p className="font-medium text-charcoal">
                                        {getContentWithFallback(article.title_translations, article.title)}
                                    </p>
                                    {/* Show source language indicator */}
                                    <span className="text-xs text-slate flex items-center gap-1 mt-1">
                                        <Globe className="w-3 h-3" />
                                        {LANGUAGE_NAMES[article.source_language]}
                                    </span>
                                </td>
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
                        className="bg-white p-6 rounded-2xl w-full max-w-4xl space-y-5 max-h-[90vh] overflow-y-auto"
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

                        {/* Source Language Selection */}
                        <div className="bg-gradient-to-r from-teal/10 to-blue-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe className="w-5 h-5 text-teal" />
                                <span className="font-medium text-charcoal">{getLocal('writeIn')}</span>
                            </div>
                            <div className="flex gap-2">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, source_language: lang })}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${formData.source_language === lang
                                            ? 'bg-teal text-white shadow-md'
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'articleTitle')}</label>
                                <input
                                    required
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    placeholder={t('articles', 'articleTitle')}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    dir={formData.source_language === 'ar' ? 'rtl' : 'ltr'}
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
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Media Upload - Images & Videos */}
                        <MediaUploader
                            images={formData.images}
                            videos={formData.videos}
                            onImagesChange={(images) => setFormData({ ...formData, images })}
                            onVideosChange={(videos) => setFormData({ ...formData, videos })}
                            folder="articles"
                        />

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'excerpt')}</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                                placeholder={t('articles', 'excerpt')}
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                dir={formData.source_language === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'content')}</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(html) => setFormData({ ...formData, content: html })}
                                placeholder={getLocal('writeContent')}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-gradient-to-r from-teal to-teal-light text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {getLocal('translating')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {editingArticle ? t('articles', 'saveChanges') : t('articles', 'addArticle')}
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

export default AdminArticles;
