import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Settings,
    Save,
    RotateCcw,
    Globe,
    Bell,
    Shield,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    CheckCircle,
    Database,
    Users
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    language: string;
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    primaryColor: string;
    enableEmailNotifications: boolean;
    allowComments: boolean;
    maintenanceMode: boolean;
}

const defaultSettings: SiteSettings = {
    siteName: 'جريدة ثانوية الأمير مولاي عبد الله',
    siteDescription: 'الموقع الرسمي لجريدة ثانوية الأمير مولاي عبد الله',
    contactEmail: 'info@lycee-pma.ma',
    contactPhone: '+212 5XX-XXXXXX',
    address: 'الدار البيضاء، المغرب',
    language: 'ar',
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
    primaryColor: '#0d9488',
    enableEmailNotifications: true,
    allowComments: true,
    maintenanceMode: false,
};

const AdminSettings = () => {
    const { hasPermission, users } = useAdmin();
    const { t, language: currentLang } = useLanguage();
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [activeTab, setActiveTab] = useState('general');
    const { toast } = useToast();

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('siteSettings');
        if (saved) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(saved) });
            } catch {
                setSettings(defaultSettings);
            }
        }
    }, []);

    // Check if user has permission to access this page
    if (!hasPermission('canManageSettings')) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-charcoal mb-2">{t('messages', 'notAllowed')}</h2>
                        <p className="text-slate">{t('users', 'cannotDeleteSelf')}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const handleSave = () => {
        localStorage.setItem('siteSettings', JSON.stringify(settings));
        toast({ title: t('common', 'success'), description: t('settings', 'settingsSaved') });
    };

    const handleReset = () => {
        if (confirm(t('settings', 'confirmReset'))) {
            setSettings(defaultSettings);
            localStorage.setItem('siteSettings', JSON.stringify(defaultSettings));
            toast({ title: t('common', 'success'), description: t('settings', 'settingsReset') });
        }
    };

    const tabs = [
        { id: 'general', name: t('settings', 'general'), icon: Globe },
        { id: 'social', name: t('settings', 'social'), icon: Facebook },
        { id: 'notifications', name: t('settings', 'notifications'), icon: Bell },
        { id: 'advanced', name: t('settings', 'advanced'), icon: Shield },
    ];

    // Get localStorage size
    const getLocalStorageSize = () => {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2;
            }
        }
        return (total / 1024).toFixed(2);
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('settings', 'settings')} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="space-y-6">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-teal/20 to-teal-light/20 rounded-2xl">
                                <Settings className="w-8 h-8 text-teal" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-charcoal">{t('settings', 'settings')}</h1>
                                <p className="text-slate mt-1.5">{t('settings', 'siteSettings')}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-2 bg-gray-100 text-charcoal px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {t('settings', 'reset')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal to-teal-light text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-teal/30 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                {t('settings', 'saveSettings')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl p-2 shadow-card border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-teal to-teal-light text-white shadow-md'
                                    : 'text-slate hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                <Globe className="w-5 h-5 text-teal" />
                                {t('settings', 'generalSettings')}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">{t('settings', 'siteNameLabel')}</label>
                                    <input
                                        type="text"
                                        value={settings.siteName}
                                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">{t('settings', 'languageLabel')}</label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    >
                                        <option value="ar">العربية</option>
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('settings', 'siteDescriptionLabel')}</label>
                                <textarea
                                    value={settings.siteDescription}
                                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                    rows={3}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {t('settings', 'emailLabel')}
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.contactEmail}
                                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {t('settings', 'phoneLabel')}
                                    </label>
                                    <input
                                        type="tel"
                                        value={settings.contactPhone}
                                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {t('settings', 'addressLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                <Facebook className="w-5 h-5 text-blue-600" />
                                {t('settings', 'socialLinks')}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <Facebook className="w-4 h-4 text-blue-600" />
                                        Facebook
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.facebook}
                                        onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <Twitter className="w-4 h-4 text-sky-500" />
                                        Twitter
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.twitter}
                                        onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 outline-none"
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <Instagram className="w-4 h-4 text-pink-600" />
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.instagram}
                                        onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 outline-none"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                                        <Youtube className="w-4 h-4 text-red-600" />
                                        YouTube
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.youtube}
                                        onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                <Bell className="w-5 h-5 text-gold" />
                                {t('settings', 'notificationSettings')}
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div>
                                        <h3 className="font-semibold text-charcoal">{t('settings', 'emailNotifications')}</h3>
                                        <p className="text-sm text-slate">{t('settings', 'emailNotificationsDesc')}</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, enableEmailNotifications: !settings.enableEmailNotifications })}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${settings.enableEmailNotifications ? 'bg-teal' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${settings.enableEmailNotifications ? 'left-7' : 'left-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div>
                                        <h3 className="font-semibold text-charcoal">{t('settings', 'allowComments')}</h3>
                                        <p className="text-sm text-slate">{t('settings', 'allowCommentsDesc')}</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, allowComments: !settings.allowComments })}
                                        className={`relative w-14 h-8 rounded-full transition-colors ${settings.allowComments ? 'bg-teal' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${settings.allowComments ? 'left-7' : 'left-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Settings */}
                    {activeTab === 'advanced' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" />
                                {t('settings', 'advancedSettings')}
                            </h2>


                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Database className="w-5 h-5 text-teal" />
                                        <h3 className="font-semibold text-charcoal">{t('settings', 'storageInfo')}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate">{t('settings', 'localStorageSize')}</span>
                                            <span className="font-medium text-charcoal">{getLocalStorageSize()} KB</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate">{t('settings', 'usersCount')}</span>
                                            <span className="font-medium text-charcoal">{users.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <h3 className="font-semibold text-charcoal">{t('settings', 'systemStatus')}</h3>
                                    </div>
                                    <p className="text-sm text-green-700">{t('settings', 'systemNormal')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;