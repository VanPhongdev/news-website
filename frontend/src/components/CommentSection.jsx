import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './CommentSection.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CommentSection = ({ articleId }) => {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [articleId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${API_URL}/comments/article/${articleId}`);
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
                `${API_URL}/comments`,
                {
                    article: articleId,
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

    return (
        <div className="font-sans">
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">
                Bình luận ({comments.length})
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
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                {comment.user?.username ? (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {comment.user.username.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="bg-gray-50 dark:bg-surface-dark p-4 rounded-xl rounded-tl-none">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                            {comment.user?.username || 'Người dùng'}
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
                                    <button className="hover:text-primary flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                                        Thích
                                    </button>
                                    <button className="hover:text-primary">Trả lời</button>
                                </div>
                            </div>
                        </div>
                    ))
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
