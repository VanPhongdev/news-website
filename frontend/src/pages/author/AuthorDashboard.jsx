import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { articleAPI, categoryAPI, deletionRequestAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';

const AuthorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, published, draft, pending
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [deletionModal, setDeletionModal] = useState({ show: false, articleId: null, articleTitle: '' });
    const [deletionReason, setDeletionReason] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        thumbnail: '',
        category: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [articlesRes, categoriesRes, deletionRequestsRes] = await Promise.all([
                articleAPI.getArticles({ author: user._id }),
                categoryAPI.getCategories(),
                deletionRequestAPI.getMyRequests()
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingArticle) {
                await articleAPI.updateArticle(editingArticle._id, formData);
                alert('Cập nhật bài viết thành công');
            } else {
                await articleAPI.createArticle(formData);
                alert('Tạo bài viết thành công');
            }
            setFormData({ title: '', content: '', excerpt: '', thumbnail: '', category: '' });
            setShowForm(false);
            setEditingArticle(null);
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu bài viết'));
        }
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt || '',
            thumbnail: article.thumbnail || '',
            category: article.category._id
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
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

    const handleSubmitForReview = async (id) => {
        try {
            await articleAPI.submitArticle(id);
            setArticles(articles.map(a => a._id === id ? { ...a, status: 'pending' } : a));
            alert('Đã gửi bài viết để duyệt');
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể gửi bài viết'));
        }
    };

    const handleRequestDeletion = (articleId, articleTitle) => {
        setDeletionModal({ show: true, articleId, articleTitle });
        setDeletionReason('');
    };

    const confirmDeletionRequest = async () => {
        if (!deletionReason || deletionReason.trim().length < 10) {
            alert('Vui lòng nhập lý do xóa (ít nhất 10 ký tự)');
            return;
        }

        try {
            await deletionRequestAPI.createRequest(deletionModal.articleId, deletionReason);
            alert('Đã gửi yêu cầu xóa bài viết');
            setDeletionModal({ show: false, articleId: null, articleTitle: '' });
            setDeletionReason('');
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể gửi yêu cầu'));
        }
    };

    const getDeletionRequestForArticle = (articleId) => {
        return deletionRequests.find(req => req.article?._id === articleId && req.status === 'pending');
    };

    // Calculate stats
    const stats = {
        totalArticles: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        drafts: articles.filter(a => a.status === 'draft').length,
        totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0)
    };

    // Filter articles by tab
    const filteredArticles = articles.filter(article => {
        if (activeTab === 'all') return true;
        if (activeTab === 'published') return article.status === 'published';
        if (activeTab === 'draft') return article.status === 'draft';
        if (activeTab === 'pending') return article.status === 'pending';
        return true;
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
                                <p className="text-text-secondary text-xs">Author</p>
                            </div>
                        </div>

                        {/* Menu */}
                        <nav className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => setShowForm(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!showForm
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">book_2</span>
                                <span className="text-sm font-semibold">Bài viết của tôi</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(true);
                                    setEditingArticle(null);
                                    setFormData({ title: '', content: '', excerpt: '', thumbnail: '', category: '' });
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${showForm && !editingArticle
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-primary dark:text-gray-300 hover:bg-surface-light dark:hover:bg-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">edit_square</span>
                                <span className="text-sm font-medium">Viết bài</span>
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
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                        {!showForm ? (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
                                            <p className="text-text-secondary text-sm font-medium">Tổng lượt xem</p>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                            <p className="text-text-secondary text-sm font-medium">Đã đăng</p>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.published}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-text-secondary text-[20px]">edit_note</span>
                                            <p className="text-text-secondary text-sm font-medium">Bản nháp</p>
                                        </div>
                                        <p className="text-text-primary dark:text-white text-2xl font-bold">{stats.drafts}</p>
                                    </div>
                                </div>

                                {/* Articles Table */}
                                <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                                    {/* Tabs */}
                                    <div className="border-b border-border-light dark:border-border-dark px-6">
                                        <div className="flex gap-8 overflow-x-auto">
                                            <button
                                                onClick={() => setActiveTab('all')}
                                                className={`group flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-1 transition-colors ${activeTab === 'all'
                                                    ? 'border-b-primary'
                                                    : 'border-b-transparent hover:border-b-gray-300'
                                                    }`}
                                            >
                                                <p className={`text-sm font-bold ${activeTab === 'all' ? 'text-primary' : 'text-text-secondary'}`}>
                                                    Tất cả ({articles.length})
                                                </p>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('published')}
                                                className={`group flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-1 transition-colors ${activeTab === 'published'
                                                    ? 'border-b-primary'
                                                    : 'border-b-transparent hover:border-b-gray-300'
                                                    }`}
                                            >
                                                <p className={`text-sm font-medium ${activeTab === 'published' ? 'text-primary' : 'text-text-secondary'}`}>
                                                    Đã đăng ({stats.published})
                                                </p>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('draft')}
                                                className={`group flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-1 transition-colors ${activeTab === 'draft'
                                                    ? 'border-b-primary'
                                                    : 'border-b-transparent hover:border-b-gray-300'
                                                    }`}
                                            >
                                                <p className={`text-sm font-medium ${activeTab === 'draft' ? 'text-primary' : 'text-text-secondary'}`}>
                                                    Bản nháp ({stats.drafts})
                                                </p>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('pending')}
                                                className={`group flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-1 transition-colors ${activeTab === 'pending'
                                                    ? 'border-b-primary'
                                                    : 'border-b-transparent hover:border-b-gray-300'
                                                    }`}
                                            >
                                                <p className={`text-sm font-medium ${activeTab === 'pending' ? 'text-primary' : 'text-text-secondary'}`}>
                                                    Chờ duyệt ({articles.filter(a => a.status === 'pending').length})
                                                </p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="w-full overflow-x-auto min-h-[400px]">
                                        <table className="w-full min-w-[700px]">
                                            <thead className="bg-surface-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[40%]">Tiêu đề bài viết</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[15%]">Trạng thái</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[20%]">Ngày tạo</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-text-secondary w-[10%]">Lượt xem</th>
                                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-text-secondary w-[15%]">Hành động</th>
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
                                                                        <p className="text-xs text-text-secondary">{article.category?.name}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                    article.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    }`}>
                                                                    {article.status === 'published' ? 'Đã đăng' :
                                                                        article.status === 'draft' ? 'Bản nháp' : 'Chờ duyệt'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm text-text-primary dark:text-gray-300">
                                                                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm font-bold text-text-primary dark:text-white">
                                                                    {article.views || 0}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {article.status === 'draft' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleEdit(article)}
                                                                                className="text-text-secondary hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                title="Chỉnh sửa"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleSubmitForReview(article._id)}
                                                                                className="text-text-secondary hover:text-green-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                title="Gửi duyệt"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">send</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(article._id)}
                                                                                className="text-text-secondary hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                title="Xóa"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {article.status === 'pending' && (
                                                                        <button
                                                                            onClick={() => navigate(`/article/${article.slug}`)}
                                                                            className="text-text-secondary hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                            title="Xem chi tiết"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                                        </button>
                                                                    )}
                                                                    {article.status === 'published' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => navigate(`/article/${article.slug}`)}
                                                                                className="text-text-secondary hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                title="Xem bài viết"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                                            </button>
                                                                            {!getDeletionRequestForArticle(article._id) && (
                                                                                <button
                                                                                    onClick={() => handleRequestDeletion(article._id, article.title)}
                                                                                    className="text-text-secondary hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                                    title="Yêu cầu xóa"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                                </button>
                                                                            )}
                                                                        </>
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
                            </>
                        ) : (
                            /* Create/Edit Form */
                            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-text-primary dark:text-white">
                                        {editingArticle ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingArticle(null);
                                            setFormData({ title: '', content: '', excerpt: '', thumbnail: '', category: '' });
                                        }}
                                        className="text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">close</span>
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">Tiêu đề *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">Chuyên mục *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            required
                                        >
                                            <option value="">-- Chọn chuyên mục --</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">Tóm tắt</label>
                                        <textarea
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">Nội dung *</label>
                                        <RichTextEditor
                                            value={formData.content}
                                            onChange={(value) => setFormData({ ...formData, content: value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">URL hình ảnh</label>
                                        <input
                                            type="text"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingArticle(null);
                                                setFormData({ title: '', content: '', excerpt: '', thumbnail: '', category: '' });
                                            }}
                                            className="px-5 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-primary dark:text-white hover:bg-surface-light dark:hover:bg-border-dark transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm"
                                        >
                                            {editingArticle ? 'Cập nhật bài viết' : 'Tạo bài viết'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Deletion Request Modal */}
            {
                deletionModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-surface-dark rounded-xl p-6 min-w-[500px] max-w-[600px] shadow-xl">
                            <h3 className="text-text-primary dark:text-white text-xl font-bold mb-4">Yêu cầu xóa bài viết</h3>
                            <p className="text-text-secondary mb-4">
                                Bài viết: <strong>{deletionModal.articleTitle}</strong>
                            </p>
                            <div className="mb-4">
                                <label className="block text-text-primary dark:text-white text-sm font-medium mb-2">
                                    Lý do xóa bài viết: <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={deletionReason}
                                    onChange={(e) => setDeletionReason(e.target.value)}
                                    placeholder="Nhập lý do tại sao bạn muốn xóa bài viết này (ít nhất 10 ký tự)..."
                                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                                />
                                <small className="text-text-secondary">{deletionReason.length}/500 ký tự</small>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setDeletionModal({ show: false, articleId: null, articleTitle: '' });
                                        setDeletionReason('');
                                    }}
                                    className="px-4 py-2 bg-surface-light dark:bg-border-dark text-text-primary dark:text-white rounded-lg hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDeletionRequest}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Gửi yêu cầu
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default AuthorDashboard;
