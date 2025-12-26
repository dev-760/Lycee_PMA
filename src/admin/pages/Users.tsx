import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    X,
    Save,
    Shield,
    User,
    Mail,
    Lock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Eye,
    EyeOff
} from 'lucide-react';
import AdminLayout from '@/admin/components/Layout';
import { useAdmin, AdminUser, UserRole } from '@/admin/context/Context';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

const AdminUsers = () => {
    const { currentUser, users, addUser, updateUser, deleteUser, validateUserPassword } = useAdmin();
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'editor' as UserRole,
        isActive: true
    });
    const { toast } = useToast();

    // Password strength validation
    const passwordStrength = useMemo(() => {
        if (!formData.password) return null;
        return validateUserPassword(formData.password);
    }, [formData.password, validateUserPassword]);

    // Check if user is super_admin - only super_admin can access this page
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

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openNewModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            name: '',
            email: '',
            role: 'editor',
            isActive: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            name: user.name,
            email: user.email || '',
            role: user.role,
            isActive: user.isActive
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (user: AdminUser) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            const result = await updateUser(editingUser.id, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive,
                ...(formData.password && { password: formData.password })
            });

            if (result.success) {
                toast({ title: t('messages', 'updated'), description: t('users', 'userUpdated') });
                setIsModalOpen(false);
            } else {
                toast({ title: t('common', 'error'), description: result.error, variant: 'destructive' });
            }
        } else {
            if (!formData.password) {
                toast({ title: t('common', 'error'), description: t('users', 'passwordRequired'), variant: 'destructive' });
                return;
            }

            const result = await addUser({
                username: formData.username,
                password: formData.password,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive
            });

            if (result.success) {
                toast({ title: t('messages', 'added'), description: t('users', 'userAdded') });
                setIsModalOpen(false);
            } else {
                toast({ title: t('common', 'error'), description: result.error, variant: 'destructive' });
            }
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        const result = await deleteUser(userToDelete.id);
        if (result.success) {
            toast({ title: t('messages', 'deleted'), description: t('users', 'userDeleted') });
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } else {
            toast({ title: t('common', 'error'), description: result.error, variant: 'destructive' });
        }
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

    const formatDate = (date: string) => {
        const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
        return new Date(date).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Stats
    const stats = [
        { label: t('common', 'all'), value: users.length, color: 'bg-charcoal' },
        { label: t('users', 'superAdmin'), value: users.filter(u => u.role === 'super_admin').length, color: 'bg-purple-500' },
        { label: t('users', 'editor'), value: users.filter(u => u.role === 'editor').length, color: 'bg-blue-500' },
        { label: t('users', 'administrator'), value: users.filter(u => u.role === 'administrator').length, color: 'bg-amber-500' },
    ];

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('users', 'manageUsers')} - {t('auth', 'controlPanel')}</title>
            </Helmet>

            <div className="space-y-6">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-charcoal">{t('users', 'manageUsers')}</h1>
                                <p className="text-slate mt-1.5">{t('users', 'addEditDeleteUsers')}</p>
                            </div>
                        </div>
                        <button
                            onClick={openNewModal}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            {t('users', 'addUser')}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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

                {/* Search */}
                <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('users', 'searchUsers')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Enhanced Users Table */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('users', 'user')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('admin', 'role')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('users', 'status')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-bold text-charcoal uppercase tracking-wide">{t('admin', 'lastLogin')}</th>
                                    <th className="text-start px-6 py-4 text-sm font-semibold text-charcoal">{t('articles', 'actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5 transition-all duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-charcoal flex items-center gap-2">
                                                        {user.name}
                                                        {user.id === currentUser?.id && (
                                                            <span className="text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full">{t('users', 'you')}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate">@{user.username}</p>
                                                    {user.email && <p className="text-xs text-slate flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {t('roles', user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ? (
                                                <span className="flex items-center gap-1.5 text-green-600 text-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {t('common', 'active')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-red-500 text-sm">
                                                    <XCircle className="w-4 h-4" />
                                                    {t('common', 'inactive')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate">
                                            {user.lastLogin ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(user.lastLogin)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">{t('users', 'neverLoggedIn')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title={t('common', 'edit')}
                                                >
                                                    <Edit2 className="w-4 h-4 text-purple-600" />
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={t('common', 'delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-slate">{t('users', 'noUsers')}</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-charcoal">
                                {editingUser ? t('users', 'editUser') : t('users', 'addUser')}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('users', 'fullName')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                                    required
                                />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">{t('auth', 'username')}</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('users', 'email')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    {t('auth', 'password')}
                                    {editingUser && <span className="text-xs text-slate font-normal"> ({t('users', 'keepOldPassword')})</span>}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pr-12 pl-12 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                                        required={!editingUser}
                                        placeholder={language === 'ar' ? 'أدخل كلمة مرور قوية' : language === 'fr' ? 'Entrez un mot de passe fort' : 'Enter a strong password'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && passwordStrength && (
                                    <div className="mt-3 space-y-2">
                                        {/* Strength Bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-full flex-1 rounded-full transition-colors ${passwordStrength.score >= level
                                                            ? passwordStrength.score >= 3
                                                                ? 'bg-green-500'
                                                                : passwordStrength.score >= 2
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-red-500'
                                                            : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`text-xs font-medium ${passwordStrength.score >= 3 ? 'text-green-600' :
                                                passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-500'
                                                }`}>
                                                {passwordStrength.score >= 4
                                                    ? (language === 'ar' ? 'قوية جداً' : language === 'fr' ? 'Très fort' : 'Very Strong')
                                                    : passwordStrength.score >= 3
                                                        ? (language === 'ar' ? 'قوية' : language === 'fr' ? 'Fort' : 'Strong')
                                                        : passwordStrength.score >= 2
                                                            ? (language === 'ar' ? 'متوسطة' : language === 'fr' ? 'Moyen' : 'Medium')
                                                            : (language === 'ar' ? 'ضعيفة' : language === 'fr' ? 'Faible' : 'Weak')
                                                }
                                            </span>
                                        </div>

                                        {/* Requirements */}
                                        {passwordStrength.errors.length > 0 && (
                                            <ul className="text-xs space-y-1 text-red-500">
                                                {passwordStrength.errors.map((err, idx) => (
                                                    <li key={idx} className="flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        {err}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {passwordStrength.isValid && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                {language === 'ar' ? 'كلمة المرور تستوفي المتطلبات' : language === 'fr' ? 'Le mot de passe répond aux exigences' : 'Password meets requirements'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">{t('admin', 'role')}</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none"
                                >
                                    <option value="editor">{t('users', 'editor')}</option>
                                    <option value="administrator">{t('users', 'administrator')}</option>
                                    <option value="super_admin">{t('users', 'superAdmin')}</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="isActive" className="flex-1">
                                    <span className="font-medium text-charcoal">{t('users', 'activeAccount')}</span>
                                    <p className="text-xs text-slate mt-0.5">{t('users', 'activeAccountDesc')}</p>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingUser ? t('articles', 'saveChanges') : t('users', 'addUser')}
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
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-charcoal mb-2">{t('common', 'confirm')} {t('common', 'delete')}</h2>
                            <p className="text-slate mb-6">
                                {t('users', 'confirmDelete')}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors"
                                >
                                    {t('common', 'delete')}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-slate font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('common', 'cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
