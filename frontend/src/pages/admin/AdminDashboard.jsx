import { useState, useEffect } from 'react';
import { userAPI, categoryAPI, articleAPI, deletionRequestAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deletionStatusFilter, setDeletionStatusFilter] = useState('pending');
    const [roleChangeModal, setRoleChangeModal] = useState({ show: false, userId: null, currentRole: '' });
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, categoriesRes, articlesRes, deletionRequestsRes] = await Promise.all([
                userAPI.getUsers(),
                categoryAPI.getCategories(),
                articleAPI.getArticles({ limit: 1000 }),
                deletionRequestAPI.getAllRequests()
            ]);
            setUsers(usersRes.data.data);
            setCategories(categoriesRes.data.data);
            setArticles(articlesRes.data.data);
            setDeletionRequests(deletionRequestsRes.data.data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa user này?')) {
            try {
                await userAPI.deleteUser(id);
                setUsers(users.filter(u => u._id !== id));
                alert('Xóa user thành công');
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa user'));
            }
        }
    };

    const handleChangeRole = (id, currentRole) => {
        setRoleChangeModal({ show: true, userId: id, currentRole });
        setSelectedRole(currentRole);
    };

    const confirmRoleChange = async () => {
        const { userId } = roleChangeModal;
        try {
            await userAPI.updateUserRole(userId, selectedRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: selectedRole } : u));
            alert('Cập nhật role thành công');
            setRoleChangeModal({ show: false, userId: null, currentRole: '' });
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật role'));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa chuyên mục này?')) {
            try {
                await categoryAPI.deleteCategory(id);
                setCategories(categories.filter(c => c._id !== id));
                alert('Xóa chuyên mục thành công');
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa chuyên mục'));
            }
        }
    };

    const handleDeleteArticle = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
            try {
                await articleAPI.deleteArticle(id);
                setArticles(articles.filter(a => a._id !== id));
                alert('Xóa bài viết thành công');
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa bài viết'));
            }
        }
    };

    const handleApproveDeletion = async (id) => {
        if (window.confirm('Đồng ý xóa bài viết này? Hành động không thể hoàn tác!')) {
            try {
                await deletionRequestAPI.approveRequest(id);
                alert('Đã phê duyệt và xóa bài viết');
                fetchData();
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phê duyệt'));
            }
        }
    };

    const handleRejectDeletion = async (id) => {
        if (window.confirm('Từ chối yêu cầu xóa bài viết này?')) {
            try {
                await deletionRequestAPI.rejectRequest(id);
                alert('Đã từ chối yêu cầu xóa');
                fetchData();
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể từ chối'));
            }
        }
    };

    // Calculate stats
    const stats = {
        totalUsers: users.length,
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        pendingDeletions: deletionRequests.filter(r => r.status === 'pending').length,
        totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-text-secondary">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display">
            {/* Sidebar */}
            <aside className="flex flex-col w-64 bg-white dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex-shrink-0">
                <div className="p-4 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-4">
                        {/* User Profile */}
                        <div className="flex gap-3 items-center px-2 py-1">
                            <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[24px]">person</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-text-primary dark:text-white text-base font-bold">
                                    {user.username}
                                </h1>
                                <p className="text-text-secondary text-xs">Admin</p>
                            </div>
                        </div>

                        {/* Menu */}
                        <nav className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard'
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">space_dashboard</span>
                                <p className="text-sm font-medium">Dashboard</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'users'
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">group</span>
                                <p className="text-sm font-medium">Người dùng</p>
                                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{users.length}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'categories'
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">category</span>
                                <p className="text-sm font-medium">Chuyên mục</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('articles')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'articles'
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">article</span>
                                <p className="text-sm font-medium">Bài viết</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('deletionRequests')}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'deletionRequests'
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
                                <p className="text-sm font-medium">Yêu cầu xóa</p>
                                {stats.pendingDeletions > 0 && (
                                    <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{stats.pendingDeletions}</span>
                                )}
                            </button>
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">home</span>
                                <p className="text-sm font-medium">Trang chủ</p>
                            </Link>
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2 w-full text-text-secondary hover:text-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[24px]">logout</span>
                            <span className="text-sm font-medium">Đăng xuất</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-col flex-1 h-full overflow-hidden">

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="text-text-secondary text-sm font-medium">Tổng số người dùng</p>
                                            <span className="material-symbols-outlined text-primary text-[24px]">group</span>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold mt-2">{stats.totalUsers}</p>
                                        <p className="text-text-secondary text-xs">Người dùng</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="text-text-secondary text-sm font-medium">Tổng số bài viết</p>
                                            <span className="material-symbols-outlined text-primary text-[24px]">article</span>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold mt-2">{stats.totalArticles}</p>
                                        <p className="text-text-secondary text-xs">{stats.publishedArticles} bài viết đã đăng</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="text-text-secondary text-sm font-medium">Tổng số lượt xem</p>
                                            <span className="material-symbols-outlined text-primary text-[24px]">visibility</span>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold mt-2">{stats.totalViews.toLocaleString()}</p>
                                        <p className="text-text-secondary text-xs">Tổng số lượt xem</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="text-text-secondary text-sm font-medium">Yêu cầu xóa</p>
                                            <span className="material-symbols-outlined text-red-500 text-[24px]">delete_sweep</span>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold mt-2">{stats.pendingDeletions}</p>
                                        <p className="text-text-secondary text-xs">Chờ phê duyệt</p>
                                    </div>
                                </div>

                                {/* Quick Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm p-6">
                                        <h3 className="text-text-primary dark:text-white font-bold mb-4">Thống kê người dùng theo vai trò</h3>
                                        <div className="flex flex-col gap-3">
                                            {['admin', 'editor', 'author', 'reader'].map(role => {
                                                const count = users.filter(u => u.role === role).length;
                                                const percentage = users.length > 0 ? (count / users.length * 100).toFixed(0) : 0;
                                                return (
                                                    <div key={role} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-purple-500' :
                                                                role === 'editor' ? 'bg-blue-500' :
                                                                    role === 'author' ? 'bg-green-500' : 'bg-gray-500'
                                                                }`}></div>
                                                            <span className="text-sm text-text-primary dark:text-white capitalize">{role}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-text-secondary">{count}</span>
                                                            <span className="text-xs text-text-secondary">({percentage}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm p-6">
                                        <h3 className="text-text-primary dark:text-white font-bold mb-4">Thống kê bài viết theo trạng thái</h3>
                                        <div className="flex flex-col gap-3">
                                            {['published', 'draft', 'pending'].map(status => {
                                                const count = articles.filter(a => a.status === status).length;
                                                const percentage = articles.length > 0 ? (count / articles.length * 100).toFixed(0) : 0;
                                                return (
                                                    <div key={status} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-green-500' :
                                                                status === 'draft' ? 'bg-yellow-500' : 'bg-orange-500'
                                                                }`}></div>
                                                            <span className="text-sm text-text-primary dark:text-white capitalize">{status}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-text-secondary">{count}</span>
                                                            <span className="text-xs text-text-secondary">({percentage}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                    <h3 className="text-text-primary dark:text-white text-lg font-bold">Danh sách người dùng</h3>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white text-sm"
                                    >
                                        <option value="all">Tất cả ({users.length})</option>
                                        <option value="admin">Admin ({users.filter(u => u.role === 'admin').length})</option>
                                        <option value="editor">Editor ({users.filter(u => u.role === 'editor').length})</option>
                                        <option value="author">Author ({users.filter(u => u.role === 'author').length})</option>
                                        <option value="reader">Reader ({users.filter(u => u.role === 'reader').length})</option>
                                    </select>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-light dark:bg-background-dark">
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Tên người dùng</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Email</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Vai trò</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Ngày tạo</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {users
                                                .filter(user => roleFilter === 'all' || user.role === roleFilter)
                                                .map(user => (
                                                    <tr key={user._id} className="hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                        <td className="px-6 py-4 text-text-primary dark:text-white text-sm font-medium">{user.username}</td>
                                                        <td className="px-6 py-4 text-text-secondary text-sm">{user.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                                user.role === 'editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                    user.role === 'author' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-text-secondary text-sm">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleChangeRole(user._id, user.role)}
                                                                className="mr-2 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                                            >
                                                                Đổi role
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Categories Tab */}
                        {activeTab === 'categories' && (
                            <div className="rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
                                    <h3 className="text-text-primary dark:text-white text-lg font-bold">Danh sách danh mục</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-light dark:bg-background-dark">
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Tên</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Slug</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Mô tả</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Người tạo</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {categories.map(category => (
                                                <tr key={category._id} className="hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                    <td className="px-6 py-4 text-text-primary dark:text-white text-sm font-medium">{category.name}</td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm">{category.slug}</td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm max-w-xs truncate">{category.description}</td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm">{category.createdBy?.username}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteCategory(category._id)}
                                                            className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Articles Tab */}
                        {activeTab === 'articles' && (
                            <div className="rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
                                    <h3 className="text-text-primary dark:text-white text-lg font-bold">Danh sách bài viết</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-light dark:bg-background-dark">
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Tiêu đề</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Tác giả</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Danh mục</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Trạng thái</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Lượt xem</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {articles.map(article => (
                                                <tr key={article._id} className="hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                    <td className="px-6 py-4 text-text-primary dark:text-white text-sm font-medium max-w-xs truncate">{article.title}</td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm">{article.author?.username}</td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm">{article.category?.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                            article.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                            }`}>
                                                            {article.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm">{article.views || 0}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteArticle(article._id)}
                                                            className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Deletion Requests Tab */}
                        {activeTab === 'deletionRequests' && (
                            <div className="rounded-xl bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                    <h3 className="text-text-primary dark:text-white text-lg font-bold">Yêu cầu xóa bài viết</h3>
                                    <select
                                        value={deletionStatusFilter}
                                        onChange={(e) => setDeletionStatusFilter(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white text-sm"
                                    >
                                        <option value="all">Tất cả ({deletionRequests.length})</option>
                                        <option value="pending">Chờ duyệt ({deletionRequests.filter(r => r.status === 'pending').length})</option>
                                        <option value="approved">Đã duyệt ({deletionRequests.filter(r => r.status === 'approved').length})</option>
                                        <option value="rejected">Đã từ chối ({deletionRequests.filter(r => r.status === 'rejected').length})</option>
                                    </select>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-light dark:bg-background-dark">
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Bài viết</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Tác giả</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Lý do</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Ngày yêu cầu</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Trạng thái</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase">Người duyệt</th>
                                                <th className="px-6 py-3 text-text-secondary text-xs font-bold uppercase text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {deletionRequests
                                                .filter(req => deletionStatusFilter === 'all' || req.status === deletionStatusFilter)
                                                .map(request => (
                                                    <tr key={request._id} className="hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                        <td className="px-6 py-4 text-text-primary dark:text-white text-sm font-medium max-w-xs truncate">
                                                            {request.article?.title || '[Đã xóa]'}
                                                        </td>
                                                        <td className="px-6 py-4 text-text-secondary text-sm">{request.author?.username}</td>
                                                        <td className="px-6 py-4 text-text-secondary text-sm max-w-xs truncate">{request.reason}</td>
                                                        <td className="px-6 py-4 text-text-secondary text-sm">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-text-secondary text-sm">
                                                            {request.reviewedBy?.username || '-'}
                                                            {request.reviewedAt && <><br /><small>{new Date(request.reviewedAt).toLocaleDateString('vi-VN')}</small></>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {request.status === 'pending' ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApproveDeletion(request._id)}
                                                                        className="mr-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                                                    >
                                                                        ✓ Duyệt
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectDeletion(request._id)}
                                                                        className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                                    >
                                                                        ✗ Từ chối
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="text-text-secondary text-sm">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Role Change Modal */}
            {roleChangeModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 min-w-[400px] shadow-xl">
                        <h3 className="text-text-primary dark:text-white text-xl font-bold mb-4">Thay đổi vai trò</h3>
                        <div className="mb-4">
                            <label className="block text-text-secondary text-sm font-medium mb-2">Chọn vai trò mới:</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white"
                            >
                                <option value="reader">Reader (Độc giả)</option>
                                <option value="author">Author (Tác giả)</option>
                                <option value="editor">Editor (Biên tập viên)</option>
                                <option value="admin">Admin (Quản trị viên)</option>
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRoleChangeModal({ show: false, userId: null, currentRole: '' })}
                                className="px-4 py-2 bg-surface-light dark:bg-border-dark text-text-primary dark:text-white rounded-lg hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
