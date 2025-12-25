import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Shield,
    Search,
    Clock,
    LogIn,
    LogOut,
    Lock,
    UserPlus,
    UserMinus,
    Key,
    AlertTriangle,
    RefreshCw,
    Trash2
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { getSecurityLogs, SecurityEvent } from '@/admin/utils/security';

const SecurityLogs = () => {
    const { currentUser } = useAdmin();
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [logs, setLogs] = useState<SecurityEvent[]>(getSecurityLogs());

    // Only super_admin can access this page
    if (!currentUser || currentUser.role !== 'super_admin') {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">{t('messages', 'notAllowed')}</h2>
                        <p className="text-slate">{t('users', 'onlySuperAdmin')}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const refreshLogs = () => {
        setLogs(getSecurityLogs());
    };

    const clearLogs = () => {
        if (confirm(language === 'ar' ? 'هل تريد حذف جميع السجلات؟' : language === 'fr' ? 'Voulez-vous supprimer tous les journaux?' : 'Are you sure you want to clear all logs?')) {
            localStorage.removeItem('securityLog');
            setLogs([]);
        }
    };

    const getEventIcon = (type: SecurityEvent['type']) => {
        switch (type) {
            case 'login_success':
                return <LogIn className="w-4 h-4 text-green-600" />;
            case 'login_failed':
                return <LogIn className="w-4 h-4 text-red-500" />;
            case 'logout':
                return <LogOut className="w-4 h-4 text-blue-500" />;
            case 'session_expired':
                return <Clock className="w-4 h-4 text-amber-500" />;
            case 'account_locked':
                return <Lock className="w-4 h-4 text-red-600" />;
            case 'password_change':
                return <Key className="w-4 h-4 text-purple-500" />;
            case 'user_created':
                return <UserPlus className="w-4 h-4 text-teal" />;
            case 'user_deleted':
                return <UserMinus className="w-4 h-4 text-red-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-slate" />;
        }
    };

    const getEventLabel = (type: SecurityEvent['type']) => {
        const labels = {
            ar: {
                login_success: 'تسجيل دخول ناجح',
                login_failed: 'فشل تسجيل الدخول',
                logout: 'تسجيل خروج',
                session_expired: 'انتهاء الجلسة',
                account_locked: 'قفل الحساب',
                password_change: 'تغيير كلمة المرور',
                user_created: 'إنشاء مستخدم',
                user_deleted: 'حذف مستخدم'
            },
            en: {
                login_success: 'Login Success',
                login_failed: 'Login Failed',
                logout: 'Logout',
                session_expired: 'Session Expired',
                account_locked: 'Account Locked',
                password_change: 'Password Changed',
                user_created: 'User Created',
                user_deleted: 'User Deleted'
            },
            fr: {
                login_success: 'Connexion réussie',
                login_failed: 'Échec de connexion',
                logout: 'Déconnexion',
                session_expired: 'Session expirée',
                account_locked: 'Compte verrouillé',
                password_change: 'Mot de passe modifié',
                user_created: 'Utilisateur créé',
                user_deleted: 'Utilisateur supprimé'
            }
        };
        return labels[language]?.[type] || labels.en[type];
    };

    const getEventBadgeColor = (type: SecurityEvent['type']) => {
        switch (type) {
            case 'login_success':
            case 'user_created':
                return 'bg-green-100 text-green-700';
            case 'login_failed':
            case 'account_locked':
            case 'user_deleted':
                return 'bg-red-100 text-red-700';
            case 'logout':
                return 'bg-blue-100 text-blue-700';
            case 'session_expired':
                return 'bg-amber-100 text-amber-700';
            case 'password_change':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (timestamp: number) => {
        const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
        return new Date(timestamp).toLocaleString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const eventTypes = ['all', 'login_success', 'login_failed', 'logout', 'session_expired', 'account_locked', 'password_change', 'user_created', 'user_deleted'];

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || log.type === filterType;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const stats = [
        {
            label: language === 'ar' ? 'إجمالي الأحداث' : language === 'fr' ? 'Total des événements' : 'Total Events',
            value: logs.length,
            color: 'bg-charcoal'
        },
        {
            label: language === 'ar' ? 'تسجيلات دخول ناجحة' : language === 'fr' ? 'Connexions réussies' : 'Successful Logins',
            value: logs.filter(l => l.type === 'login_success').length,
            color: 'bg-green-500'
        },
        {
            label: language === 'ar' ? 'محاولات فاشلة' : language === 'fr' ? 'Tentatives échouées' : 'Failed Attempts',
            value: logs.filter(l => l.type === 'login_failed').length,
            color: 'bg-red-500'
        },
        {
            label: language === 'ar' ? 'حسابات مقفلة' : language === 'fr' ? 'Comptes verrouillés' : 'Locked Accounts',
            value: logs.filter(l => l.type === 'account_locked').length,
            color: 'bg-amber-500'
        },
    ];

    return (
        <AdminLayout>
            <Helmet>
                <title>{language === 'ar' ? 'سجلات الأمان' : language === 'fr' ? 'Journaux de sécurité' : 'Security Logs'} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal flex items-center gap-3">
                            <Shield className="w-8 h-8 text-red-500" />
                            {language === 'ar' ? 'سجلات الأمان' : language === 'fr' ? 'Journaux de sécurité' : 'Security Logs'}
                        </h1>
                        <p className="text-slate mt-1">
                            {language === 'ar' ? 'مراقبة أحداث الأمان والنشاط' : language === 'fr' ? 'Surveiller les événements de sécurité' : 'Monitor security events and activity'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={refreshLogs}
                            className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-dark transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {language === 'ar' ? 'تحديث' : language === 'fr' ? 'Actualiser' : 'Refresh'}
                        </button>
                        <button
                            onClick={clearLogs}
                            className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            {language === 'ar' ? 'مسح' : language === 'fr' ? 'Effacer' : 'Clear'}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                                <div>
                                    <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                                    <p className="text-xs text-slate">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث في السجلات...' : language === 'fr' ? 'Rechercher dans les journaux...' : 'Search logs...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none transition-all"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                    >
                        <option value="all">{language === 'ar' ? 'جميع الأحداث' : language === 'fr' ? 'Tous les événements' : 'All Events'}</option>
                        {eventTypes.slice(1).map(type => (
                            <option key={type} value={type}>{getEventLabel(type as SecurityEvent['type'])}</option>
                        ))}
                    </select>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">
                                        {language === 'ar' ? 'النوع' : language === 'fr' ? 'Type' : 'Type'}
                                    </th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">
                                        {language === 'ar' ? 'المستخدم' : language === 'fr' ? 'Utilisateur' : 'User'}
                                    </th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">
                                        {language === 'ar' ? 'التفاصيل' : language === 'fr' ? 'Détails' : 'Details'}
                                    </th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">
                                        {language === 'ar' ? 'الوقت' : language === 'fr' ? 'Heure' : 'Time'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(log.type)}`}>
                                                {getEventIcon(log.type)}
                                                {getEventLabel(log.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-charcoal">@{log.username}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate max-w-xs truncate">
                                            {log.details || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(log.timestamp)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12">
                            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-slate">
                                {language === 'ar' ? 'لا توجد سجلات أمان' : language === 'fr' ? 'Aucun journal de sécurité' : 'No security logs'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Security Tips */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                    <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        {language === 'ar' ? 'نصائح أمنية' : language === 'fr' ? 'Conseils de sécurité' : 'Security Tips'}
                    </h2>
                    <ul className="space-y-2 text-sm text-slate">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                            {language === 'ar' ? 'راجع محاولات تسجيل الدخول الفاشلة بانتظام' : language === 'fr' ? 'Vérifiez régulièrement les tentatives de connexion échouées' : 'Review failed login attempts regularly'}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                            {language === 'ar' ? 'تحقق من أي نشاط مشبوه في الحسابات' : language === 'fr' ? 'Vérifiez toute activité suspecte sur les comptes' : 'Investigate any suspicious account activity'}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                            {language === 'ar' ? 'تأكد من تغيير كلمات المرور بشكل دوري' : language === 'fr' ? 'Assurez-vous de changer les mots de passe périodiquement' : 'Ensure passwords are changed periodically'}
                        </li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SecurityLogs;
