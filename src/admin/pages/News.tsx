import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

/* Article type (keep local, no mockData) */
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

const AdminNews = () => {
  const { hasPermission } = useAdmin();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [news, setNews] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Article | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'أخبار الإدارة',
    author: 'الإدارة',
    image: '',
  });

  /* FETCH NEWS FROM API */
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const allArticles = await api.articles.getAll();
        const adminNews = allArticles.filter(
          (a: Article) =>
            a.category === 'أخبار الإدارة' ||
            a.category === 'Administration News'
        );
        setNews(adminNews);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to load news',
          variant: 'destructive',
        });
      }
    };

    fetchNews();
  }, []);

  /* PERMISSION CHECK */
  if (!hasPermission('canManageNews')) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-center">
          <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold">{t('messages', 'notAllowed')}</h2>
          <p className="text-slate">{t('users', 'editorPermissions')}</p>
        </div>
      </AdminLayout>
    );
  }

  const filteredNews = news.filter(
    (n) =>
      n.title.includes(searchQuery) ||
      n.content?.includes(searchQuery)
  );

  /* ADD / EDIT */
  const openNewModal = () => {
    if (!hasPermission('canCreate')) return;
    setEditingNews(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'أخبار الإدارة',
      author: 'الإدارة',
      image: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Article) => {
    if (!hasPermission('canEdit')) return;
    setEditingNews(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  /* SAVE */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNews) {
        await api.articles.update(editingNews.id, formData);
        toast({ title: t('messages', 'updated') });
      } else {
        await api.articles.create({
          ...formData,
          date: new Date().toISOString(),
        });
        toast({ title: t('messages', 'added') });
      }

      const updated = await api.articles.getAll();
      setNews(
        updated.filter((a: Article) =>
          a.category.includes('أخبار')
        )
      );

      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  /* DELETE */
  const handleDelete = async (id: number) => {
    if (!hasPermission('canDelete')) return;
    if (!confirm(t('news', 'confirmDelete'))) return;

    try {
      await api.articles.delete(id);
      setNews(news.filter((n) => n.id !== id));
      toast({ title: t('messages', 'deleted') });
    } catch {
      toast({
        title: 'Error',
        description: 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('news', 'manageNews')}</title>
      </Helmet>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-blue-600" />
          {t('news', 'manageNews')}
        </h1>

        {hasPermission('canCreate') ? (
          <button
            onClick={openNewModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus />
            {t('news', 'addNews')}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-slate">
            <Lock /> View only
          </div>
        )}
      </div>

      {/* SEARCH */}
      <div className="mb-4 relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full p-4 rounded-xl border"
          placeholder={t('news', 'searchNews')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl overflow-hidden shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-start">{t('articles', 'image')}</th>
              <th className="p-4 text-start">{t('news', 'newsTitle')}</th>
              <th className="p-4">{t('articles', 'date')}</th>
              <th className="p-4">{t('articles', 'actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">
                  <img src={item.image} className="w-20 rounded" />
                </td>
                <td className="p-4 font-medium">{item.title}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4 flex gap-2">
                  <a href={`/article/${item.id}`} target="_blank">
                    <Eye />
                  </a>
                  {hasPermission('canEdit') && (
                    <button onClick={() => openEditModal(item)}>
                      <Edit2 />
                    </button>
                  )}
                  {hasPermission('canDelete') && (
                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 className="text-red-500" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredNews.length === 0 && (
          <p className="text-center py-10 text-slate">
            {t('news', 'noNews')}
          </p>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl w-full max-w-2xl space-y-4"
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">
                {editingNews ? t('news', 'editNews') : t('news', 'addNews')}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <input
              required
              className="w-full p-3 border rounded"
              placeholder={t('news', 'newsTitle')}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <textarea
              required
              className="w-full p-3 border rounded"
              placeholder={t('news', 'summary')}
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
            />

            <textarea
              className="w-full p-3 border rounded"
              rows={5}
              placeholder={t('news', 'details')}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />

            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Save />
              {t('common', 'save')}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminNews;
