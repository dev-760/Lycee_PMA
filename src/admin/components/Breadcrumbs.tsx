import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useLanguage } from '@/i18n';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const Breadcrumbs = () => {
    const location = useLocation();
    const { isRTL, t } = useLanguage();
    const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

    const getBreadcrumbs = (): BreadcrumbItem[] => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [
            { label: t('admin', 'dashboard'), href: '/admin/dashboard' }
        ];

        if (paths.length > 1) {
            const page = paths[1];
            const pageNames: Record<string, string> = {
                'articles': t('nav', 'articles'),
                'news': t('nav', 'news'),
                'announcements': t('nav', 'announcements'),
                'users': t('users', 'manageUsers'),
                'settings': t('settings', 'settings'),
                'absent-teachers': isRTL ? 'الأساتذة الغائبون' : 'Absent Teachers',
            };

            if (pageNames[page]) {
                breadcrumbs.push({
                    label: pageNames[page],
                    href: `/admin/${page}`
                });
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    if (breadcrumbs.length <= 1) return null;

    return (
        <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
            <Link
                to="/admin/dashboard"
                className="text-slate hover:text-teal transition-colors flex items-center gap-1"
            >
                <Home className="w-4 h-4" />
            </Link>
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                    <div key={crumb.href || index} className="flex items-center gap-2">
                        <ChevronIcon className="w-4 h-4 text-gray-400" />
                        {isLast ? (
                            <span className="text-charcoal font-semibold">{crumb.label}</span>
                        ) : (
                            <Link
                                to={crumb.href || '#'}
                                className="text-slate hover:text-teal transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;

