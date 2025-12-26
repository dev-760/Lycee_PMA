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
  Newspaper,
  X,
  Save,
  Lock,
  Shield,
  Building2,
  Users
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

// News categories - all news types
const NEWS_CATEGORIES = {
  ar: [
    { value: 'أخبار المؤسسة', label: 'أخبار المؤسسة', icon: Building2, color: 'blue' },
    { value: 'أخبار الإدارة', label: 'أخبار الإدارة', icon: Users, color: 'purple' }
  ],
  fr: [
    { value: 'أخبار المؤسسة', label: 'Actualités de l\'institution', icon: Building2, color: 'blue' },
    { value: 'أخبار الإدارة', label: 'Actualités de l\'administration', icon: Users, color: 'purple' }
  ],
  en: [
    { value: 'أخبار المؤسسة', label: 'Institution News', icon: Building2, color: 'blue' },
    { value: 'أخبار الإدارة', label: 'Administration News', icon: Users, color: 'purple' }
  ]
};

const AdminNews = () => {
  const { hasPermission } = useAdmin();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
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
    image: ''
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

  // Filter by search and category
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.includes(searchQuery) || item.content?.includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category display info
  const getCategoryInfo = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    return cat || { label: categoryValue, icon: Newspaper, color: 'gray' };
  };

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
      image: ''
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
        await api.articles.update(editingNews.id, formData);

        setNews(prev =>
          prev.map(n => n.id === editingNews.id ? { ...n, ...formData } : n)
        );

        toast({
          title: t('messages', 'updated'),
          description: t('news', 'newsUpdated')
        });
      } else {
        const newNewsItem = {
          ...formData,
          date: new Date().toISOString().split('T')[0],
          featured: false
        };

        const created = await api.articles.create(newNewsItem);
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

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('news', 'manageNews')} - {t('auth', 'controlPanel')}</title>
      </Helmet>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-blue-600" />
          {t('news', 'manageNews')}
        </h1>

        {hasPermission('canCreate') ? (
          <button
            onClick={openNewModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
            placeholder={t('news', 'searchNews')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${filterCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-slate hover:bg-gray-200'
              }`}
          >
            {language === 'ar' ? 'الكل' : language === 'fr' ? 'Tous' : 'All'}
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${filterCategory === cat.value
                    ? cat.color === 'blue'
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-slate hover:bg-gray-200'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'image')}</th>
              <th className="p-4 text-start font-semibold text-charcoal">{t('news', 'newsTitle')}</th>
              <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'category')}</th>
              <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'date')}</th>
              <th className="p-4 text-start font-semibold text-charcoal">{t('articles', 'actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredNews.map((item) => {
              const catInfo = getCategoryInfo(item.category);
              const CatIcon = catInfo.icon;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-16 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Newspaper className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-charcoal">{item.title}</p>
                    <p className="text-sm text-slate line-clamp-1">{item.excerpt}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${catInfo.color === 'blue'
                        ? 'bg-blue-100 text-blue-700'
                        : catInfo.color === 'purple'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                      <CatIcon className="w-3.5 h-3.5" />
                      {catInfo.label}
                    </span>
                  </td>
                  <td className="p-4 text-slate">{item.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/article/${item.id}`}
                        target="_blank"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate" />
                      </a>
                      {hasPermission('canEdit') && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                      {hasPermission('canDelete') && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-slate">{t('news', 'noNews')}</p>
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

            {/* News Category Selection */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-3">
                {t('articles', 'category')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isSelected
                          ? cat.color === 'blue'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-slate'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected
                          ? cat.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                          : 'bg-gray-100'
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                placeholder="https://..."
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded-lg" />
              )}
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
      )}
    </AdminLayout>
  );
};

export default AdminNews;
