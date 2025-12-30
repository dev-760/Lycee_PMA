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
import Breadcrumbs from './Breadcrumbs';

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
    ].filter(item => item.show);

    const isActive = (href: string) => {
        if (href === '/admin/dashboard') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleVisitSite = async (e: React.MouseEvent) => {
        e.preventDefault();
        await logout();
        navigate('/');
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
            {/* Enhanced Sidebar */}
            <aside className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-72 bg-gradient-to-br from-navy via-navy-light to-navy transform transition-transform duration-300 lg:translate-x-0 shadow-2xl ${isSidebarOpen
                ? 'translate-x-0'
                : isRTL
                    ? 'translate-x-full lg:translate-x-0'
                    : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="flex flex-col h-full relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy-light/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Enhanced Logo */}
                        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                            <Link to="/admin/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 group">
                                <div className="bg-white p-2 rounded-2xl shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                                    <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white group-hover:text-gold transition-colors">{t('auth', 'controlPanel')}</h1>
                                    <p className="text-xs text-white/60">{t('common', 'siteName')}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Enhanced Navigation */}
                        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                            {navItems.map((item, index) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${active
                                            ? 'bg-gradient-to-r from-gold to-gold-light text-navy shadow-xl shadow-gold/20 scale-[1.02]'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-[1.01] hover:shadow-lg'
                                            }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Active indicator */}
                                        {active && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                                        )}
                                        <div className={`absolute inset-0 bg-gradient-to-r from-gold/20 to-gold-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${active ? 'opacity-100' : ''}`} />
                                        <div className={`relative z-10 p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'} transition-all duration-300`}>
                                            <item.icon className={`w-5 h-5 ${active ? 'text-navy' : 'text-white/80 group-hover:text-gold'} transition-colors duration-300`} />
                                        </div>
                                        <span className={`font-semibold relative z-10 flex-1 ${active ? 'text-navy' : 'text-white/80 group-hover:text-white'} transition-colors duration-300`}>{item.name}</span>
                                        {active && (
                                            <ChevronIcon className={`w-4 h-4 relative z-10 ${isRTL ? 'mr-auto' : 'ml-auto'} animate-slide-in`} />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Enhanced User section */}
                        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4 px-4 py-4 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-gold/30 transition-all duration-300">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy/40 to-navy-light/40 flex items-center justify-center border-2 border-navy/40 shadow-lg">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <Shield className="w-3 h-3 text-white/60" />
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shadow-md ${getRoleBadgeColor(currentUser?.role || '')}`}>
                                            {currentUser && getRoleDisplayName(currentUser.role)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-red-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 font-semibold group"
                            >
                                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                <span>{t('auth', 'logout')}</span>
                            </button>
                        </div>
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
                {/* Enhanced Top Header */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
                        >
                            <Menu className="w-6 h-6 text-charcoal" />
                        </button>

                        <div className="hidden sm:flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy/5 to-navy-light/5 rounded-xl border border-navy/10">
                                <Shield className="w-4 h-4 text-navy" />
                                <span className="text-gray-700 font-semibold">{t('admin', 'welcome')}, <span className="text-navy">{currentUser?.name}</span></span>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${getRoleBadgeColor(currentUser?.role || '')}`}>
                                {currentUser && getRoleDisplayName(currentUser.role)}
                            </span>
                        </div>

                        <div className={`flex items-center gap-3 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                            <LanguageSwitcher variant="admin" />
                            <a
                                href="/"
                                onClick={handleVisitSite}
                                className="text-sm text-navy hover:text-navy-light transition-colors font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-navy/5 border border-navy/10 hover:border-navy/30 transition-all duration-200"
                            >
                                {t('nav', 'visitSite')}
                                <span className="text-lg">{isRTL ? '←' : '→'}</span>
                            </a>
                        </div>
                    </div>
                </header>

                {/* Enhanced Page Content */}
                <main className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 min-h-[calc(100vh-80px)]">
                    <div className="max-w-7xl mx-auto">
                        <Breadcrumbs />
                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

// Add custom scrollbar styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        @keyframes slide-in {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-slide-in {
            animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out;
        }
    `;
    document.head.appendChild(style);
}
