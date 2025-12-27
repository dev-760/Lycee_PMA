/**
 * Admin News Page
 * 
 * Manages news articles with multilingual support.
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
  Newspaper,
  X,
  Save,
  Lock,
  Shield,
  Building2,
  Users,
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

// News categories - all news types
const NEWS_CATEGORIES = {
  ar: [
    { value: 'أخبار المؤسسة', label: 'أخبار', icon: Building2, color: 'blue' },
    { value: 'أخبار الإدارة', label: 'أخبار الإدارة', icon: Users, color: 'purple' }
  ],
  fr: [
    { value: 'أخبار المؤسسة', label: 'Actualités', icon: Building2, color: 'blue' },
    { value: 'أخبار الإدارة', label: "Actualités de l'administration", icon: Users, color: 'purple' }
  ],
  en: [
    { value: 'أخبار المؤسسة', label: 'News', icon: Building2, color: 'blue' },
    { value: 'أخبار الإدارة', label: 'Administration News', icon: Users, color: 'purple' }
  ]
};

const AdminNews = () => {
  const { hasPermission } = useAdmin();
  const { t, language, isRTL, getContentWithFallback } = useLanguage();
  const { toast } = useToast();

  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Article | null>(null);

  // Get categories for current language
  const categories = NEWS_CATEGORIES[language as keyof typeof NEWS_CATEGORIES] || NEWS_CATEGORIES.en;

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'أخبار المؤسسة',
    author: 'الإدارة',
    images: [] as string[],
    videos: [] as string[],
    source_language: 'ar' as Language,
  });

  // Fetch All News - filter articles with news categories
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await api.articles.getAll();
        // Filter for all news categories
        const newsCategories = ['أخبار المؤسسة', 'أخبار الإدارة', 'Institution News', 'Administration News'];
        const newsItems = (data || []).filter((item: Article) =>
          newsCategories.includes(item.category)
        );
        setNews(newsItems);
      } catch (error) {
        console.error(error);
        toast({
          title: t('common', 'error'),
          description: 'Failed to load news',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Permission check
  if (!hasPermission('canManageNews')) {
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

  // Get category display info
  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(c => c.value === categoryValue) || categories[0];
  };

  // Filter news based on search (searches in current language)
  const filteredNews = news.filter(item => {
    const title = getContentWithFallback(item.title_translations, item.title);
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
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

    setEditingNews(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'أخبار المؤسسة',
      author: 'الإدارة',
      images: [],
      videos: [],
      source_language: language, // Default to current UI language
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
    // Load content in source language for editing
    const sourceLang = item.source_language || 'ar';

    // Build images array from legacy image + new images array
    const allImages: string[] = [];
    if (item.image) allImages.push(item.image);
    if (item.images && item.images.length > 0) {
      // Add any images not already in the array
      item.images.forEach(img => {
        if (!allImages.includes(img)) allImages.push(img);
      });
    }

    setFormData({
      title: item.title_translations?.[sourceLang] || item.title,
      excerpt: item.excerpt_translations?.[sourceLang] || item.excerpt,
      content: item.content_translations?.[sourceLang] || item.content || '',
      category: item.category,
      author: item.author,
      images: allImages,
      videos: item.videos || [],
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

      if (editingNews) {
        // Update with re-translation
        const updated = await api.articles.update(
          editingNews.id,
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

        setNews(prev =>
          prev.map(n => n.id === editingNews.id ? updated : n)
        );

        toast({
          title: t('messages', 'updated'),
          description: t('news', 'newsUpdated')
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
          setNews(prev => [created, ...prev]);
          toast({
            title: t('messages', 'added'),
            description: t('news', 'newsAdded')
          });
        }
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

    if (!confirm(t('news', 'confirmDelete'))) return;

    try {
      await api.articles.delete(id);
      setNews(prev => prev.filter(n => n.id !== id));
      toast({
        title: t('messages', 'deleted'),
        description: t('news', 'newsDeleted')
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
    newsImage: { ar: 'صورة الخبر', en: 'News Image', fr: "Image de l'actualité" },
    clickUpload: { ar: 'اضغط لرفع صورة', en: 'Click to upload image', fr: 'Cliquez pour télécharger' },
    uploading: { ar: 'جاري الرفع...', en: 'Uploading...', fr: 'Téléchargement...' },
    orEnterUrl: { ar: 'أو أدخل رابط الصورة', en: 'Or enter image URL', fr: "Ou entrez l'URL de l'image" },
    writeContent: { ar: 'اكتب محتوى الخبر هنا...', en: 'Write news content here...', fr: "Écrivez le contenu de l'actualité ici..." },
  };

  const getLocal = (key: string) => localT[key]?.[language] || localT[key]?.en || key;

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('news', 'manageNews')} - {t('auth', 'controlPanel')}</title>
      </Helmet>

      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-blue-500" />
          {t('news', 'manageNews')}
        </h1>

        {hasPermission('canCreate') ? (
          <button
            onClick={openNewModal}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('news', 'addNews')}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-slate">
            <Lock className="w-4 h-4" />
            {t('articles', 'viewOnlyMode')}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
          <input
            className={`w-full p-4 ${isRTL ? 'pl-12' : 'pr-12'} rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none`}
            placeholder={t('news', 'searchNews')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          className="p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none min-w-[200px]"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">{t('common', 'all')}</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* News Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(item => {
            const category = getCategoryInfo(item.category);
            const CategoryIcon = category.icon;
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                {/* Image */}
                {item.image ? (
                  <img src={item.image} alt={getContentWithFallback(item.title_translations, item.title)} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-blue-300" />
                  </div>
                )}

                <div className="p-5">
                  {/* Category badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${category.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                    <CategoryIcon className="w-3.5 h-3.5" />
                    {category.label}
                  </div>

                  {/* Title - Multilingual */}
                  <h3 className="font-bold text-charcoal text-lg mb-2 line-clamp-2">
                    {getContentWithFallback(item.title_translations, item.title)}
                  </h3>

                  {/* Excerpt - Multilingual */}
                  <p className="text-slate text-sm mb-3 line-clamp-2">
                    {getContentWithFallback(item.excerpt_translations, item.excerpt)}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-slate mb-4">
                    <span>{item.author}</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {LANGUAGE_NAMES[item.source_language]}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <a
                      href={`/article/${item.id}`}
                      target="_blank"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={t('articles', 'view')}
                    >
                      <Eye className="w-4 h-4 text-slate" />
                    </a>
                    {hasPermission('canEdit') && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('common', 'edit')}
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredNews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card">
          <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-slate">{t('news', 'noNews')}</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl w-full max-w-4xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-charcoal">
                {editingNews ? t('news', 'editNews') : t('news', 'addNews')}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">{t('news', 'newsTitle')}</label>
                <input
                  required
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                  placeholder={t('news', 'newsTitle')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  dir={formData.source_language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'author')}</label>
                  <input
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'category')}</label>
                  <select
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
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
              folder="news"
            />

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">{t('articles', 'excerpt')}</label>
              <textarea
                required
                rows={2}
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none resize-none"
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getLocal('translating')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingNews ? t('articles', 'saveChanges') : t('news', 'addNews')}
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

export default AdminNews;
