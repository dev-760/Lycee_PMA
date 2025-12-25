import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Newspaper,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    User,
    Users,
    Shield,
    UserMinus
} from 'lucide-react';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser, logout, isAuthenticated, hasPermission } = useAdmin();
    const { t, isRTL, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/admin/login');
        return null;
    }

    // Build navigation based on permissions
    const navItems = [
        {
            name: t('admin', 'dashboard'),
            href: '/admin/dashboard',
            icon: LayoutDashboard,
            show: hasPermission('canViewDashboard')
        },
        {
            name: t('nav', 'articles'),
            href: '/admin/articles',
            icon: FileText,
            show: hasPermission('canManageArticles')
        },
        {
            name: t('nav', 'news'),
            href: '/admin/news',
            icon: Newspaper,
            show: hasPermission('canManageNews')
        },
        {
            name: t('nav', 'announcements'),
            href: '/admin/announcements',
            icon: Bell,
            show: hasPermission('canManageAnnouncements')
        },
        {
            name: isRTL ? 'الأساتذة الغائبون' : (language === 'fr' ? 'Absences' : 'Absences'),
            href: '/admin/absent-teachers',
            icon: UserMinus,
            show: hasPermission('canManageAnnouncements')
        },
        {
            name: t('users', 'manageUsers').split(' ')[0],
            href: '/admin/users',
            icon: Users,
            show: hasPermission('canManageUsers')
        },
        {
            name: t('settings', 'settings'),
            href: '/admin/settings',
            icon: Settings,
            show: hasPermission('canManageSettings')
        },
        {
            name: currentUser?.role === 'super_admin' ? (t('admin', 'security') || 'Security') : '',
            href: '/admin/security',
            icon: Shield,
            show: currentUser?.role === 'super_admin'
        },
    ].filter(item => item.show);

    const isActive = (href: string) => location.pathname === href;

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    // Get role display name
    const getRoleDisplayName = (role: string) => {
        return t('roles', role);
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

    const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-72 bg-gradient-to-b from-charcoal to-charcoal-light transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen
                ? 'translate-x-0'
                : isRTL
                    ? 'translate-x-full lg:translate-x-0'
                    : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link to="/admin/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            <div className="bg-white p-1.5 rounded-xl shadow-lg">
                                <img
                                    src="/logo.png"
                                    alt="Logo"
                                    className="w-10 h-10 object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">{t('auth', 'controlPanel')}</h1>
                                <p className="text-xs text-white/50">{t('common', 'siteName')}</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                    ? 'bg-gradient-to-r from-teal to-teal-light text-white shadow-lg shadow-teal/30'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                                {isActive(item.href) && <ChevronIcon className={`w-4 h-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />}
                            </Link>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-white/5 rounded-xl backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal/30 to-teal-dark/30 flex items-center justify-center border border-teal/30">
                                <User className="w-5 h-5 text-teal" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Shield className="w-3 h-3 text-white/50" />
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(currentUser?.role || '')}`}>
                                        {currentUser && getRoleDisplayName(currentUser.role)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">{t('auth', 'logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 ${isRTL ? 'lg:mr-72' : 'lg:ml-72'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="w-6 h-6 text-charcoal" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate">
                            <Shield className="w-4 h-4 text-teal" />
                            <span>{t('admin', 'welcome')}, {currentUser?.name}</span>
                            <span className="text-gray-300">|</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleBadgeColor(currentUser?.role || '')}`}>
                                {currentUser && getRoleDisplayName(currentUser.role)}
                            </span>
                        </div>

                        <div className={`flex items-center gap-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                            <LanguageSwitcher variant="admin" />
                            <Link
                                to="/"
                                className="text-sm text-teal hover:text-charcoal transition-colors font-medium flex items-center gap-1"
                            >
                                {t('nav', 'visitSite')}
                                <span>{isRTL ? '←' : '→'}</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
