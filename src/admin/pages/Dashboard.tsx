import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Newspaper, Bell, Users, TrendingUp, Eye, PlusCircle, Shield, Clock } from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { articles as mockArticles, adminNews as mockAdminNews, announcements as mockAnnouncements } from '@/data/mockData';
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
        users: 0
    });
    const [recentArticles, setRecentArticles] = useState<any[]>(mockArticles);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // In a real app we would have a specific 'count' endpoint or lightweight query
                // For now, fetching all is fine for small datasets
                const [a, n, an] = await Promise.all([
                    api.articles.getAll(), // This fetches ALL articles, including news. Need to filter?
                    // actually api.articles.getAll returns 'articles' table.
                    // The app structure separates "News" and "Articles" by category usually, 
                    // BUT in the mock data 'adminNews' is a separate array?
                    // Let's check api.ts again. api.articles.getAll queries 'articles' table.
                    // api.announcements.getAll queries 'announcements'.
                    // Wait, mockData has separate exports: 'articles' and 'adminNews'.
                    // 'adminNews' items have IDs 5, 6. 'articles' have 3, 4, 7, 8.
                    // 'mainArticle' (1), 'weeklyNews' (2).
                    // In DB (seed.sql), I inserted ALL of them into 'articles' table.
                    // content with category 'أخبار الإدارة' are "News".
                    // content with 'مقالات' are "Articles".
                    // So I need to filter the result of api.articles.getAll().

                    api.articles.getAll(),
                    api.announcements.getAll()
                ]);

                if (a && an) {
                    const newsCount = a.filter((item: any) => item.category === 'أخبار الإدارة' || item.category === 'Administration News').length;
                    const articlesCount = a.length - newsCount; // Rough approximation

                    setCounts({
                        articles: articlesCount,
                        news: newsCount,
                        announcements: an.length,
                        users: users.length
                    });
                    setRecentArticles(a);
                }
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
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
            show: hasPermission('canManageArticles')
        },
        {
            name: t('admin', 'totalNews'),
            value: counts.news,
            icon: Newspaper,
            color: 'from-blue-500 to-blue-400',
            href: '/admin/news',
            show: hasPermission('canManageNews')
        },
        {
            name: t('admin', 'totalAnnouncements'),
            value: counts.announcements,
            icon: Bell,
            color: 'from-gold to-gold-light',
            href: '/admin/announcements',
            show: hasPermission('canManageAnnouncements')
        },
        {
            name: t('admin', 'totalUsers'),
            value: counts.users,
            icon: Users,
            color: 'from-purple-500 to-purple-400',
            href: '/admin/users',
            show: hasPermission('canManageUsers')
        },
    ];

    const recentActivities = {
        ar: [
            { action: 'تم نشر مقال جديد', time: 'منذ 5 دقائق', type: 'article' },
            { action: 'تم تحديث إعلان', time: 'منذ 15 دقيقة', type: 'announcement' },
            { action: 'تم إضافة خبر جديد', time: 'منذ ساعة', type: 'news' },
            { action: 'تم حذف مقال قديم', time: 'منذ ساعتين', type: 'article' },
            { action: 'تسجيل دخول جديد', time: 'منذ 3 ساعات', type: 'system' },
        ],
        en: [
            { action: 'New article published', time: '5 minutes ago', type: 'article' },
            { action: 'Announcement updated', time: '15 minutes ago', type: 'announcement' },
            { action: 'New news added', time: '1 hour ago', type: 'news' },
            { action: 'Old article deleted', time: '2 hours ago', type: 'article' },
            { action: 'New login', time: '3 hours ago', type: 'system' },
        ],
        fr: [
            { action: 'Nouvel article publié', time: 'Il y a 5 minutes', type: 'article' },
            { action: 'Annonce mise à jour', time: 'Il y a 15 minutes', type: 'announcement' },
            { action: 'Nouvelle actualité ajoutée', time: 'Il y a 1 heure', type: 'news' },
            { action: 'Ancien article supprimé', time: 'Il y a 2 heures', type: 'article' },
            { action: 'Nouvelle connexion', time: 'Il y a 3 heures', type: 'system' },
        ],
    };

    // Get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'editor':
                return 'bg-gradient-to-r from-blue-500 to-blue-400 text-white';
            case 'administrator':
                return 'bg-gradient-to-r from-amber-500 to-orange-400 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const formatLastLogin = (date: string) => {
        const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
        return new Date(date).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('admin', 'dashboard')} - {t('common', 'siteName')}</title>
            </Helmet>

            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal">{t('admin', 'dashboard')}</h1>
                        <p className="text-slate mt-1">{t('admin', 'welcome')}, {currentUser?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-card border border-gray-100">
                        <Shield className="w-5 h-5 text-teal" />
                        <span className="text-sm text-slate">{t('admin', 'role')}:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(currentUser?.role || '')}`}>
                            {currentUser && t('roles', currentUser.role)}
                        </span>
                    </div>
                </div>

                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-teal to-teal-dark rounded-2xl p-6 text-white shadow-lg shadow-teal/20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{t('admin', 'welcomeMessage')}!</h2>
                            <p className="text-white/80">
                                {t('admin', 'welcome')} <strong>{currentUser?.name}</strong>
                            </p>
                            {currentUser?.lastLogin && (
                                <p className="text-white/60 text-sm mt-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {t('admin', 'lastLogin')}: {formatLastLogin(currentUser.lastLogin)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {hasPermission('canCreate') && (
                                <Link
                                    to="/admin/articles?action=new"
                                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-all"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    {t('admin', 'newArticle')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.filter(s => s.show).map((stat) => (
                        <Link
                            key={stat.name}
                            to={stat.href}
                            className="group bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold text-charcoal mb-1">{stat.value}</p>
                            <p className="text-sm text-slate">{stat.name}</p>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    {hasPermission('canCreate') && (
                        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                            <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-teal" />
                                {t('admin', 'quickAdd')}
                            </h2>
                            <div className="space-y-3">
                                {hasPermission('canManageArticles') && (
                                    <Link
                                        to="/admin/articles?action=new"
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-teal hover:bg-teal/5 transition-all group"
                                    >
                                        <FileText className="w-5 h-5 text-slate group-hover:text-teal" />
                                        <span className="font-medium text-charcoal group-hover:text-teal">{t('admin', 'newArticle')}</span>
                                    </Link>
                                )}
                                {hasPermission('canManageNews') && (
                                    <Link
                                        to="/admin/news?action=new"
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <Newspaper className="w-5 h-5 text-slate group-hover:text-blue-600" />
                                        <span className="font-medium text-charcoal group-hover:text-blue-600">{t('admin', 'newNews')}</span>
                                    </Link>
                                )}
                                {hasPermission('canManageAnnouncements') && (
                                    <Link
                                        to="/admin/announcements?action=new"
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gold hover:bg-gold/5 transition-all group"
                                    >
                                        <Bell className="w-5 h-5 text-slate group-hover:text-gold" />
                                        <span className="font-medium text-charcoal group-hover:text-gold">{t('admin', 'newAnnouncement')}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className={`${hasPermission('canCreate') ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl p-6 shadow-card border border-gray-100`}>
                        <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-teal" />
                            {t('admin', 'recentActivity')}
                        </h2>
                        <div className="space-y-4">
                            {recentActivities[language].map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`w-2 h-2 rounded-full ${activity.type === 'article' ? 'bg-teal' :
                                        activity.type === 'news' ? 'bg-blue-500' :
                                            activity.type === 'announcement' ? 'bg-gold' : 'bg-purple-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-charcoal">{activity.action}</p>
                                        <p className="text-xs text-slate">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Permissions Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                    <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal" />
                        {t('admin', 'yourPermissions')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className={`p-3 rounded-xl text-center ${hasPermission('canViewDashboard') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-xs font-medium text-charcoal">{t('admin', 'viewDashboard')}</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${hasPermission('canCreate') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-xs font-medium text-charcoal">{t('admin', 'addContent')}</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${hasPermission('canEdit') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-xs font-medium text-charcoal">{t('admin', 'editContent')}</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${hasPermission('canDelete') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-xs font-medium text-charcoal">{t('admin', 'deleteContent')}</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${hasPermission('canManageUsers') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-xs font-medium text-charcoal">{t('admin', 'manageUsers')}</p>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${hasPermission('canManageSettings') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-xs font-medium text-charcoal">{t('admin', 'manageSettings')}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Articles Table */}
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-charcoal">{t('admin', 'recentArticles')}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'articleTitle')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'author')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'category')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'date')}</th>
                                    {hasPermission('canEdit') && (
                                        <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'actions')}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentArticles.slice(0, 5).map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-charcoal text-sm line-clamp-1">{article.title}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">{article.author}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-teal/10 text-teal text-xs font-medium rounded-full">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">{article.date}</td>
                                        {hasPermission('canEdit') && (
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/admin/articles`}
                                                    className="text-teal hover:text-charcoal text-sm font-medium transition-colors"
                                                >
                                                    {t('common', 'edit')}
                                                </Link>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
