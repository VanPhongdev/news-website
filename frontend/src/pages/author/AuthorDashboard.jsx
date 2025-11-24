import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
                articleAPI.getArticles({ author: user._id }), // Filter by author on backend
                categoryAPI.getCategories(),
                deletionRequestAPI.getMyRequests()
            ]);
            // Không cần lọc ở đây, backend đã lọc theo tác giả
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
            fetchData(); // Refresh to get updated deletion requests
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể gửi yêu cầu'));
        }
    };

    const getDeletionRequestForArticle = (articleId) => {
        return deletionRequests.find(req => req.article?._id === articleId);
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container dashboard">
            <h2>Author Dashboard</h2>

            <div style={{ marginBottom: '2rem' }}>
                {!showForm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setShowForm(true);
                            setEditingArticle(null);
                            setFormData({ title: '', content: '', excerpt: '', thumbnail: '', category: '' });
                        }}
                    >
                        + Viết bài mới
                    </button>
                )}
            </div>

            {showForm && (
                <div className="form-container" style={{ marginBottom: '2rem' }}>
                    <h3>{editingArticle ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tiêu đề *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Chuyên mục *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">-- Chọn chuyên mục --</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tóm tắt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                style={{ minHeight: '80px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nội dung *</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>URL hình ảnh</label>
                            <input
                                type="text"
                                value={formData.thumbnail}
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingArticle ? 'Cập nhật bài viết' : 'Tạo bài viết'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingArticle(null);
                                    setFormData({ title: '', content: '', excerpt: '', thumbnail: '', category: '' });
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="article-list">
                <h3>Bài viết của tôi ({articles.length})</h3>
                {articles.length === 0 ? (
                    <p>Bạn chưa có bài viết nào. Hãy viết bài mới!</p>
                ) : (
                    articles.map(article => (
                        <div key={article._id} className="article-item">
                            <h3>{article.title}</h3>
                            <div className="article-meta">
                                <span>Chuyên mục: {article.category?.name}</span>
                                {' • '}
                                <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                                {' • '}
                                <span className={`status-badge status-${article.status}`}>{article.status}</span>
                            </div>
                            {article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}
                            <div className="article-actions">
                                {article.status === 'draft' && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/article/${article.slug}`)}
                                        >
                                            👁️ Xem chi tiết
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleEdit(article)}
                                        >
                                            ✏️ Chỉnh sửa
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleSubmitForReview(article._id)}
                                        >
                                            📤 Gửi duyệt
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(article._id)}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </>
                                )}
                                {article.status === 'pending' && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/article/${article.slug}`)}
                                        >
                                            👁️ Xem chi tiết
                                        </button>
                                        <span style={{ color: '#856404' }}>⏳ Đang chờ duyệt...</span>
                                    </>
                                )}
                                {article.status === 'approved' && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/article/${article.slug}`)}
                                        >
                                            👁️ Xem chi tiết
                                        </button>
                                        <span style={{ color: '#155724' }}>✓ Đã được duyệt, chờ đăng</span>
                                    </>
                                )}
                                {article.status === 'rejected' && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/article/${article.slug}`)}
                                        >
                                            👁️ Xem chi tiết
                                        </button>
                                        <span style={{ color: '#721c24' }}>✗ Bị từ chối</span>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleEdit(article)}
                                        >
                                            ✏️ Chỉnh sửa lại
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleSubmitForReview(article._id)}
                                        >
                                            📤 Gửi lại để duyệt
                                        </button>
                                    </>
                                )}
                                {article.status === 'published' && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate(`/article/${article.slug}`)}
                                        >
                                            👁️ Xem chi tiết
                                        </button>
                                        <span style={{ color: '#0c5460' }}>📰 Đã đăng • 👁️ {article.views} lượt xem</span>
                                        {(() => {
                                            const deletionReq = getDeletionRequestForArticle(article._id);
                                            if (deletionReq) {
                                                if (deletionReq.status === 'pending') {
                                                    return <span style={{ color: '#856404', marginLeft: '1rem' }}>🗑️ Đang chờ duyệt xóa</span>;
                                                } else if (deletionReq.status === 'rejected') {
                                                    return (
                                                        <>
                                                            <span style={{ color: '#721c24', marginLeft: '1rem' }}>❌ Yêu cầu xóa bị từ chối</span>
                                                            <button
                                                                className="btn btn-danger"
                                                                style={{ marginLeft: '0.5rem' }}
                                                                onClick={() => handleRequestDeletion(article._id, article.title)}
                                                            >
                                                                🔄 Gửi lại yêu cầu
                                                            </button>
                                                        </>
                                                    );
                                                }
                                            } else {
                                                return (
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ marginLeft: '1rem' }}
                                                        onClick={() => handleRequestDeletion(article._id, article.title)}
                                                    >
                                                        🗑️ Yêu cầu xóa
                                                    </button>
                                                );
                                            }
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Deletion Request Modal */}
            {deletionModal.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '10px',
                        minWidth: '500px',
                        maxWidth: '600px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginBottom: '1rem' }}>Yêu cầu xóa bài viết</h3>
                        <p style={{ marginBottom: '1rem', color: '#666' }}>
                            Bài viết: <strong>{deletionModal.articleTitle}</strong>
                        </p>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Lý do xóa bài viết: <span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                                value={deletionReason}
                                onChange={(e) => setDeletionReason(e.target.value)}
                                placeholder="Nhập lý do tại sao bạn muốn xóa bài viết này (ít nhất 10 ký tự)..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '0.75rem',
                                    borderRadius: '5px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                            <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                                {deletionReason.length}/500 ký tự
                            </small>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setDeletionModal({ show: false, articleId: null, articleTitle: '' });
                                    setDeletionReason('');
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDeletionRequest}
                            >
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorDashboard;
