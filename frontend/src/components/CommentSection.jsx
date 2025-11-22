import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentAPI } from '../services/api';
import './CommentSection.css';

const CommentSection = ({ articleId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState('');

    // Tải bình luận khi component mount
    useEffect(() => {
        fetchComments();
    }, [articleId]);

    const fetchComments = async () => {
        try {
            const response = await commentAPI.getCommentsByArticle(articleId);
            setComments(response.data.data);
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setError('Vui lòng nhập nội dung bình luận');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await commentAPI.createComment(articleId, newComment);
            setComments([response.data.data, ...comments]);
            setNewComment('');
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể gửi bình luận');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) {
            setError('Vui lòng nhập nội dung bình luận');
            return;
        }

        try {
            const response = await commentAPI.updateComment(commentId, editContent);
            setComments(comments.map(c => c._id === commentId ? response.data.data : c));
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể cập nhật bình luận');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            return;
        }

        try {
            await commentAPI.deleteComment(commentId);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể xóa bình luận');
        }
    };

    const startEdit = (comment) => {
        setEditingId(comment._id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const canComment = isAuthenticated && (user?.role === 'reader' || user?.role === 'author');

    return (
        <div className="comment-section">
            <h3>Bình luận ({comments.length})</h3>

            {/* Comment Form */}
            {canComment ? (
                <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        rows="4"
                        disabled={submitting}
                    />
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                </form>
            ) : (
                <div className="comment-notice">
                    {isAuthenticated
                        ? 'Chỉ người dùng có vai trò Reader hoặc Author mới có thể bình luận.'
                        : 'Vui lòng đăng nhập để bình luận.'}
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="loading">Đang tải bình luận...</div>
            ) : comments.length === 0 ? (
                <div className="no-comments">Chưa có bình luận nào.</div>
            ) : (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                                <span className="comment-author">{comment.author?.username}</span>
                                <span className="comment-date">
                                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                            </div>

                            {editingId === comment._id ? (
                                <div className="comment-edit">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows="3"
                                    />
                                    <div className="comment-edit-actions">
                                        <button onClick={() => handleEditComment(comment._id)}>Lưu</button>
                                        <button onClick={cancelEdit}>Hủy</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="comment-content">{comment.content}</div>
                                    {isAuthenticated && (user?._id === comment.author?._id || user?.role === 'admin') && (
                                        <div className="comment-actions">
                                            {user?._id === comment.author?._id && (
                                                <button onClick={() => startEdit(comment)}>Sửa</button>
                                            )}
                                            <button onClick={() => handleDeleteComment(comment._id)}>Xóa</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
