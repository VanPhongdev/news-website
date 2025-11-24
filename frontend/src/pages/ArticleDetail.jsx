import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { articleAPI } from '../services/api';
import CommentSection from '../components/CommentSection';

const ArticleDetail = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true; // Flag to prevent double call

        const fetchArticle = async () => {
            try {
                const response = await articleAPI.getArticleBySlug(slug);
                if (isMounted) {
                    setArticle(response.data.data);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.response?.data?.message || 'Không thể tải bài viết');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchArticle();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [slug]);

    if (loading) {
        return <div className="loading">Đang tải bài viết...</div>;
    }

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="alert alert-error">Không tìm thấy bài viết</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="card">
                <h2>{article.title}</h2>
                <div className="article-meta" style={{ marginBottom: '1.5rem' }}>
                    <span>Tác giả: {article.author?.username}</span>
                    {' • '}
                    <span>Chuyên mục: {article.category?.name}</span>
                    {' • '}
                    <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                    {' • '}
                    <span>👁️ {article.views} lượt xem</span>
                </div>
                {article.thumbnail && (
                    <img
                        src={article.thumbnail}
                        alt={article.title}
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1.5rem' }}
                    />
                )}
                <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

                {/* Comment Section */}
                <CommentSection articleId={article._id} />
            </div>
        </div>
    );
};

export default ArticleDetail;
