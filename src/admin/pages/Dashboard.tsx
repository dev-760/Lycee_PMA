import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Newspaper,
  Bell,
  Users,
  TrendingUp,
  Eye,
  PlusCircle,
  Shield,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { api } from '@/lib/api';

const AdminDashboard = () => {
  const { currentUser, hasPermission, users } = useAdmin();
  const { t, language } = useLanguage();

  const [counts, setCounts] = useState({
    articles: 0,
    news: 0,
    announcements: 0,
    users: 0,
  });

  const [recentArticles, setRecentArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [articles, announcements] = await Promise.all([
          api.articles.getAll(),
          api.announcements.getAll(),
        ]);

        if (articles && announcements) {
          const newsCount = articles.filter(
            (item: any) =>
              item.category === 'أخبار الإدارة' ||
              item.category === 'Administration News'
          ).length;

          const articlesCount = articles.length - newsCount;

          setCounts({
            articles: articlesCount,
            news: newsCount,
            announcements: announcements.length,
            users: users.length,
          });

          setRecentArticles(articles);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchCounts();
  }, [users.length]);

  const stats = [
    {
      name: t('admin', 'totalArticles'),
      value: counts.articles,
      icon: FileText,
      color: 'from-teal to-teal-light',
      href: '/admin/articles',
      show: hasPermission('canManageArticles'),
    },
    {
      name: t('admin', 'totalNews'),
      value: counts.news,
      icon: Newspaper,
      color: 'from-blue-500 to-blue-400',
      href: '/admin/news',
      show: hasPermission('canManageNews'),
    },
    {
      name: t('admin', 'totalAnnouncements'),
      value: counts.announcements,
      icon: Bell,
      color: 'from-gold to-gold-light',
      href: '/admin/announcements',
      show: hasPermission('canManageAnnouncements'),
    },
    {
      name: t('admin', 'totalUsers'),
      value: counts.users,
      icon: Users,
      color: 'from-purple-500 to-purple-400',
      href: '/admin/users',
      show: hasPermission('canManageUsers'),
    },
  ];

  const recentActivities = {
    ar: [
      { action: 'تم نشر مقال جديد', time: 'منذ 5 دقائق', type: 'article' },
      { action: 'تم تحديث إعلان', time: 'منذ 15 دقيقة', type: 'announcement' },
      { action: 'تم إضافة خبر جديد', time: 'منذ ساعة', type: 'news' },
    ],
    en: [
      { action: 'New article published', time: '5 minutes ago', type: 'article' },
      { action: 'Announcement updated', time: '15 minutes ago', type: 'announcement' },
      { action: 'New news added', time: '1 hour ago', type: 'news' },
    ],
    fr: [
      { action: 'Nouvel article publié', time: 'Il y a 5 minutes', type: 'article' },
      { action: 'Annonce mise à jour', time: 'Il y a 15 minutes', type: 'announcement' },
      { action: 'Nouvelle actualité ajoutée', time: 'Il y a 1 heure', type: 'news' },
    ],
  };

  const formatLastLogin = (date: string) => {
    const locale =
      language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>
          {t('admin', 'dashboard')} - {t('common', 'siteName')}
        </title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal/10 rounded-2xl">
            <LayoutDashboard className="w-8 h-8 text-teal" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">
              {t('admin', 'dashboard')}
            </h1>
            <p className="text-slate">
              {t('admin', 'welcome')}, {currentUser?.name}
            </p>
            {currentUser?.lastLogin && (
              <p className="text-sm text-slate flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                {formatLastLogin(currentUser.lastLogin)}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.filter(s => s.show).map(stat => (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-xl transition"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} w-fit mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-charcoal">{stat.value}</p>
              <p className="text-sm text-slate">{stat.name}</p>
            </Link>
          ))}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b font-bold text-charcoal flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal" />
            {t('admin', 'recentArticles')}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y">
                {recentArticles.slice(0, 5).map(article => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate">
                      {article.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate">
                      {article.date}
                    </td>
                  </tr>
                ))}
                {recentArticles.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate"
                    >
                      لا توجد مقالات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
