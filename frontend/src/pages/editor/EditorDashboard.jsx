import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { articleAPI, categoryAPI, deletionRequestAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EditorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [articlesRes, categoriesRes, deletionRequestsRes] = await Promise.all([
                articleAPI.getArticles({ limit: 1000 }),
                categoryAPI.getCategories(),
                deletionRequestAPI.getAllRequests()
            ]);
            setArticles(articlesRes.data.data);
            setCategories(categoriesRes.data.data);
            setDeletionRequests(deletionRequestsRes.data.data);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await articleAPI.updateArticleStatus(id, newStatus);
            setArticles(articles.map(a => a._id === id ? { ...a, status: newStatus } : a));
            alert(`Đã cập nhật trạng thái thành ${newStatus}`);
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật trạng thái'));
        }
    };

    const handlePublish = async (id) => {
        try {
            await articleAPI.publishArticle(id);
            setArticles(articles.map(a => a._id === id ? { ...a, status: 'published' } : a));
            alert('Đã đăng bài thành công');
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể đăng bài'));
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await categoryAPI.createCategory(newCategory);
            setCategories([...categories, response.data.data]);
            setNewCategory({ name: '', description: '' });
            setShowCategoryForm(false);
            alert('Tạo chuyên mục thành công');
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể tạo chuyên mục'));
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
        pending: articles.filter(a => a.status === 'pending').length,
        approved: articles.filter(a => a.status === 'approved').length,
        published: articles.filter(a => a.status === 'published').length,
        pendingDeletions: deletionRequests.filter(r => r.status === 'pending').length
    };

    // Filter articles by tab
    const filteredArticles = articles.filter(article => {
        if (activeTab === 'pending') return article.status === 'pending';
        if (activeTab === 'approved') return article.status === 'approved';
        if (activeTab === 'published') return article.status === 'published';
        return false;
    });

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
                <div className="flex h-full flex-col justify-between p-4">
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
                                <p className="text-text-secondary text-xs">Editor</p>
                            </div>
                        </div>

                        {/* Menu */}
                        <nav className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'pending'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                                <span className="text-sm font-semibold">Chờ duyệt ({stats.pending})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('approved')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'approved'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                <span className="text-sm font-medium">Đã duyệt ({stats.approved})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('published')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'published'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">article</span>
                                <span className="text-sm font-medium">Đã đăng ({stats.published})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'categories'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">category</span>
                                <span className="text-sm font-medium">Chuyên mục ({categories.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('deletions')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'deletions'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
                                <span className="text-sm font-medium">Yêu cầu xóa ({stats.pendingDeletions})</span>
                            </button>
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">home</span>
                                <span className="text-sm font-medium">Trang chủ</span>
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
                <div className="flex h-full grow flex-col overflow-y-auto">
                    <div className="px-8 lg:px-12 flex flex-1 justify-center py-8">
                        <div className="flex flex-col w-full max-w-[1024px] flex-1 gap-8">

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-500 text-[20px]">pending_actions</span>
                                        <p className="text-text-secondary text-sm font-medium">Chờ duyệt</p>
                                    </div>
                                    <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                                        <p className="text-text-secondary text-sm font-medium">Đã duyệt</p>
                                    </div>
                                    <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.approved}</p>
                                </div>
                                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[20px]">article</span>
                                        <p className="text-text-secondary text-sm font-medium">Đã đăng</p>
                                    </div>
                                    <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.published}</p>
                                </div>
                                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-[20px]">delete_sweep</span>
                                        <p className="text-text-secondary text-sm font-medium">Yêu cầu xóa</p>
                                    </div>
                                    <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.pendingDeletions}</p>
                                </div>
                            </div>

                            {/* Content Area */}
                            {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'published') && (
                                <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                                    {/* Table */}
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full min-w-[700px]">
                                            <thead className="bg-surface-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[35%]">Tiêu đề bài viết</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[15%]">Tác giả</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[15%]">Chuyên mục</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[15%]">Trạng thái</th>
                                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-text-secondary w-[20%]">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                                {filteredArticles.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">
                                                            Không có bài viết nào
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredArticles.map(article => (
                                                        <tr key={article._id} className="group hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {article.thumbnail && (
                                                                        <div
                                                                            className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0 bg-cover bg-center"
                                                                            style={{ backgroundImage: `url(${article.thumbnail})` }}
                                                                        ></div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-sm font-bold text-text-primary dark:text-white group-hover:text-primary transition-colors">
                                                                            {article.title}
                                                                        </p>
                                                                        {article.excerpt && (
                                                                            <p className="text-xs text-text-secondary line-clamp-1">{article.excerpt}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">{article.author?.username}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">{article.category?.name}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                    article.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    }`}>
                                                                    {article.status === 'published' ? 'Đã đăng' :
                                                                        article.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        onClick={() => navigate(`/article/${article.slug}`)}
                                                                        className="text-text-secondary hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                        title="Xem chi tiết"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                                    </button>
                                                                    {article.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleStatusChange(article._id, 'approved')}
                                                                                className="text-text-secondary hover:text-green-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                title="Duyệt bài"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleStatusChange(article._id, 'rejected')}
                                                                                className="text-text-secondary hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                title="Từ chối"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {article.status === 'approved' && (
                                                                        <button
                                                                            onClick={() => handlePublish(article._id)}
                                                                            className="text-text-secondary hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                            title="Đăng bài"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[20px]">publish</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Categories Tab */}
                            {activeTab === 'categories' && (
                                <div className="flex flex-col gap-6">
                                    {/* Create Category Form */}
                                    {!showCategoryForm ? (
                                        <button
                                            onClick={() => setShowCategoryForm(true)}
                                            className="self-start flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">add</span>
                                            <span>Tạo chuyên mục mới</span>
                                        </button>
                                    ) : (
                                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                                            <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">Tạo chuyên mục mới</h3>
                                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                                <div>
                                                    <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">Tên chuyên mục *</label>
                                                    <input
                                                        type="text"
                                                        value={newCategory.name}
                                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">Mô tả</label>
                                                    <textarea
                                                        value={newCategory.description}
                                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="submit"
                                                        className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                                                    >
                                                        Tạo chuyên mục
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCategoryForm(false);
                                                            setNewCategory({ name: '', description: '' });
                                                        }}
                                                        className="px-5 py-2 border border-border-light dark:border-border-dark text-text-primary dark:text-white rounded-lg hover:bg-surface-light dark:hover:bg-border-dark transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Categories Table */}
                                    <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-surface-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">Tên</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">Slug</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">Mô tả</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary">Người tạo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                                    {categories.map(category => (
                                                        <tr key={category._id} className="hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm font-bold text-text-primary dark:text-white">{category.name}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-secondary">{category.slug}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">{category.description}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">{category.createdBy?.username}</p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Deletion Requests Tab */}
                            {activeTab === 'deletions' && (
                                <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full min-w-[900px]">
                                            <thead className="bg-surface-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[20%]">Bài viết</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[12%]">Tác giả</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[25%]">Lý do</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[12%]">Ngày yêu cầu</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[10%]">Trạng thái</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[12%]">Người duyệt</th>
                                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-text-secondary w-[9%]">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                                {deletionRequests.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">
                                                            Không có yêu cầu xóa nào
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    deletionRequests.map(request => (
                                                        <tr key={request._id} className="hover:bg-surface-light dark:hover:bg-background-dark transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm font-bold text-text-primary dark:text-white">
                                                                    {request.article?.title || '[Đã xóa]'}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">{request.author?.username}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-secondary line-clamp-2">{request.reason}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">
                                                                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                    request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    }`}>
                                                                    {request.status === 'approved' ? 'Đã duyệt' :
                                                                        request.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">
                                                                    {request.reviewedBy?.username || '-'}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {request.status === 'pending' && (
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => handleApproveDeletion(request._id)}
                                                                            className="text-text-secondary hover:text-green-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                            title="Duyệt"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectDeletion(request._id)}
                                                                            className="text-text-secondary hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                            title="Từ chối"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditorDashboard;
