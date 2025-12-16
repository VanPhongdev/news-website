import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './CommentSection.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CommentSection = ({ articleId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [articleId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${API_URL}/articles/${articleId}/comments`);
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/articles/${articleId}/comments`,
                {
                    content: newComment
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setNewComment('');
            fetchComments();
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể gửi bình luận');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (parentId) => {
        if (!replyContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/articles/${articleId}/comments`,
                {
                    content: replyContent,
                    parent: parentId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setReplyContent('');
            setReplyTo(null);
            fetchComments();
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const handleLike = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/comments/${commentId}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchComments();
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này? Tất cả câu trả lời sẽ bị xóa theo.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert(error.response?.data?.message || 'Không thể xóa bình luận');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins} phút trước`;
        } else if (diffHours < 24) {
            return `${diffHours} giờ trước`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} ngày trước`;
        }
    };

    const renderComment = (comment, isReply = false) => (
        <div key={comment._id} className={`flex gap-4 ${isReply ? 'ml-14 mt-4' : ''}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {comment.author?.username ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                )}
            </div>
            <div className="flex-grow">
                <div className="bg-gray-50 dark:bg-surface-dark p-4 rounded-xl rounded-tl-none">
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                            {comment.author?.username || 'Người dùng'}
                        </h4>
                        <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {comment.content}
                    </p>
                </div>
                <div className="flex gap-4 mt-2 ml-2 text-xs font-medium text-gray-500">
                    <button
                        onClick={() => handleLike(comment._id)}
                        className="hover:text-primary flex items-center gap-1"
                        disabled={!isAuthenticated}
                    >
                        <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                        {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                    </button>
                    {isAuthenticated && (
                        <button
                            onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                            className="hover:text-primary"
                        >
                            Trả lời
                        </button>
                    )}
                    {isAuthenticated && user?._id === comment.author?._id && (
                        <button
                            onClick={() => handleDelete(comment._id)}
                            className="hover:text-red-500"
                        >
                            Xóa
                        </button>
                    )}
                </div>

                {/* Reply Form */}
                {replyTo === comment._id && (
                    <div className="mt-4 ml-2">
                        <textarea
                            className="w-full p-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px] resize-y text-gray-900 dark:text-white text-sm"
                            placeholder="Viết câu trả lời..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => handleReply(comment._id)}
                                disabled={!replyContent.trim()}
                                className="bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Gửi
                            </button>
                            <button
                                onClick={() => {
                                    setReplyTo(null);
                                    setReplyContent('');
                                }}
                                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-1.5 px-4 rounded-lg transition-colors text-sm"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* Render Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4">
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="font-sans">
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">
                Bình luận ({comments.reduce((total, c) => total + 1 + (c.replies?.length || 0), 0)})
            </h3>

            {/* Comment Input */}
            {isAuthenticated ? (
                <div className="flex gap-4 mb-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-grow">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="w-full p-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-y text-gray-900 dark:text-white"
                                placeholder="Chia sẻ ý kiến của bạn..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={loading}
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !newComment.trim()}
                                    className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi bình luận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 mb-10 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Vui lòng đăng nhập để bình luận
                    </p>
                    <a
                        href="/login"
                        className="inline-block bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Đăng nhập
                    </a>
                </div>
            )}

            {/* Comment List */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </p>
                ) : (
                    comments.map((comment) => renderComment(comment))
                )}
            </div>

            {comments.length > 5 && (
                <button className="w-full py-3 mt-8 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Xem thêm bình luận
                </button>
            )}
        </div>
    );
};

export default CommentSection;
