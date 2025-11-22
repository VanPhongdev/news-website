import { useState, useEffect } from 'react';
import { articleAPI, categoryAPI, deletionRequestAPI } from '../../services/api';

const EditorDashboard = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [deletionStatusFilter, setDeletionStatusFilter] = useState('pending');
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
                articleAPI.getArticles({ limit: 1000 }), // Get all articles for editor
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
                fetchData(); // Refresh all data
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
                fetchData(); // Refresh all data
            } catch (error) {
                alert('Lỗi: ' + (error.response?.data?.message || 'Không thể từ chối'));
            }
        }
    };

    const pendingArticles = articles.filter(a => a.status === 'pending');
    const approvedArticles = articles.filter(a => a.status === 'approved');
    const publishedArticles = articles.filter(a => a.status === 'published');

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container dashboard">
            <h2>Editor Dashboard</h2>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Bài chờ duyệt ({pendingArticles.length})
                </button>
                <button
                    className={`btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('approved')}
                >
                    Bài đã duyệt ({approvedArticles.length})
                </button>
                <button
                    className={`btn ${activeTab === 'published' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('published')}
                >
                    Bài đã đăng ({publishedArticles.length})
                </button>
                <button
                    className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Quản lý Chuyên mục ({categories.length})
                </button>
                <button
                    className={`btn ${activeTab === 'deletionRequests' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('deletionRequests')}
                >
                    Yêu cầu xóa bài ({deletionRequests.filter(r => r.status === 'pending').length})
                </button>
            </div>

            {activeTab === 'pending' && (
                <div className="article-list">
                    <h3>Bài viết chờ duyệt</h3>
                    {pendingArticles.length === 0 ? (
                        <p>Không có bài viết chờ duyệt</p>
                    ) : (
                        pendingArticles.map(article => (
                            <div key={article._id} className="article-item">
                                <h3>{article.title}</h3>
                                <div className="article-meta">
                                    <span>Tác giả: {article.author?.username}</span>
                                    {' • '}
                                    <span>Chuyên mục: {article.category?.name}</span>
                                    {' • '}
                                    <span className={`status-badge status-${article.status}`}>{article.status}</span>
                                </div>
                                <p className="article-excerpt">{article.excerpt}</p>
                                <div className="article-actions">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleStatusChange(article._id, 'approved')}
                                    >
                                        ✓ Duyệt bài
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleStatusChange(article._id, 'rejected')}
                                    >
                                        ✗ Từ chối
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'approved' && (
                <div className="article-list">
                    <h3>Bài viết đã duyệt</h3>
                    {approvedArticles.length === 0 ? (
                        <p>Không có bài viết đã duyệt</p>
                    ) : (
                        approvedArticles.map(article => (
                            <div key={article._id} className="article-item">
                                <h3>{article.title}</h3>
                                <div className="article-meta">
                                    <span>Tác giả: {article.author?.username}</span>
                                    {' • '}
                                    <span>Chuyên mục: {article.category?.name}</span>
                                    {' • '}
                                    <span className={`status-badge status-${article.status}`}>{article.status}</span>
                                </div>
                                <p className="article-excerpt">{article.excerpt}</p>
                                <div className="article-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handlePublish(article._id)}
                                    >
                                        📰 Đăng bài
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'published' && (
                <div className="article-list">
                    <h3>Bài viết đã đăng</h3>
                    {publishedArticles.length === 0 ? (
                        <p>Chưa có bài viết nào được đăng</p>
                    ) : (
                        publishedArticles.map(article => (
                            <div key={article._id} className="article-item">
                                <h3>{article.title}</h3>
                                <div className="article-meta">
                                    <span>Tác giả: {article.author?.username}</span>
                                    {' • '}
                                    <span>Chuyên mục: {article.category?.name}</span>
                                    {' • '}
                                    <span>👁️ {article.views} lượt xem</span>
                                    {' • '}
                                    <span className={`status-badge status-${article.status}`}>{article.status}</span>
                                </div>
                                <p className="article-excerpt">{article.excerpt}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'categories' && (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCategoryForm(!showCategoryForm)}
                        >
                            {showCategoryForm ? 'Hủy' : '+ Tạo chuyên mục mới'}
                        </button>
                    </div>

                    {showCategoryForm && (
                        <div className="form-container" style={{ marginBottom: '2rem' }}>
                            <h3>Tạo chuyên mục mới</h3>
                            <form onSubmit={handleCreateCategory}>
                                <div className="form-group">
                                    <label>Tên chuyên mục</label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Tạo chuyên mục</button>
                            </form>
                        </div>
                    )}

                    <div className="table-container">
                        <h3>Danh sách chuyên mục</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>Slug</th>
                                    <th>Mô tả</th>
                                    <th>Người tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(category => (
                                    <tr key={category._id}>
                                        <td>{category.name}</td>
                                        <td>{category.slug}</td>
                                        <td>{category.description}</td>
                                        <td>{category.createdBy?.username}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'deletionRequests' && (
                <div className="table-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Yêu cầu xóa bài viết</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ fontWeight: '500' }}>Lọc theo trạng thái:</label>
                            <select
                                value={deletionStatusFilter}
                                onChange={(e) => setDeletionStatusFilter(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '5px', border: '2px solid #e0e0e0' }}
                            >
                                <option value="all">Tất cả ({deletionRequests.length})</option>
                                <option value="pending">Chờ duyệt ({deletionRequests.filter(r => r.status === 'pending').length})</option>
                                <option value="approved">Đã duyệt ({deletionRequests.filter(r => r.status === 'approved').length})</option>
                                <option value="rejected">Đã từ chối ({deletionRequests.filter(r => r.status === 'rejected').length})</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Bài viết</th>
                                <th>Tác giả</th>
                                <th>Lý do</th>
                                <th>Ngày yêu cầu</th>
                                <th>Trạng thái</th>
                                <th>Người xét duyệt</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletionRequests
                                .filter(req => deletionStatusFilter === 'all' || req.status === deletionStatusFilter)
                                .map(request => (
                                    <tr key={request._id}>
                                        <td>{request.article?.title || '[Đã xóa]'}</td>
                                        <td>{request.author?.username}</td>
                                        <td style={{ maxWidth: '300px' }}>{request.reason}</td>
                                        <td>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td><span className={`status-badge status-${request.status}`}>{request.status}</span></td>
                                        <td>
                                            {request.reviewedBy?.username || '-'}
                                            {request.reviewedAt && <><br /><small>{new Date(request.reviewedAt).toLocaleDateString('vi-VN')}</small></>}
                                        </td>
                                        <td>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-success"
                                                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                                                        onClick={() => handleApproveDeletion(request._id)}
                                                    >
                                                        ✓ Duyệt
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.25rem 0.75rem' }}
                                                        onClick={() => handleRejectDeletion(request._id)}
                                                    >
                                                        ✗ Từ chối
                                                    </button>
                                                </>
                                            )}
                                            {request.status !== 'pending' && <span>-</span>}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EditorDashboard;
