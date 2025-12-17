import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleAPI } from '../services/api';
import CommentSection from '../components/CommentSection';

const ArticleDetail = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [mostViewedArticles, setMostViewedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Scroll to top when article changes
        window.scrollTo(0, 0);

        let isMounted = true;

        const fetchArticle = async () => {
            try {
                const response = await articleAPI.getArticleBySlug(slug);
                if (isMounted) {
                    setArticle(response.data.data);
                    // Fetch related articles from same category
                    if (response.data.data.category) {
                        fetchRelatedArticles(response.data.data.category._id, response.data.data._id);
                    }
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

        const fetchRelatedArticles = async (categoryId, currentArticleId) => {
            try {
                const response = await articleAPI.getArticles({
                    category: categoryId,
                    status: 'published',
                    limit: 4
                });
                if (isMounted) {
                    // Filter out current article
                    const filtered = response.data.data.filter(a => a._id !== currentArticleId);
                    setRelatedArticles(filtered.slice(0, 2));
                }
            } catch (error) {
                console.error('Error fetching related articles:', error);
            }
        };

        const fetchMostViewedArticles = async () => {
            try {
                const response = await articleAPI.getArticles({
                    status: 'published',
                    limit: 5,
                    sort: '-views'
                });
                if (isMounted) {
                    setMostViewedArticles(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching most viewed articles:', error);
            }
        };

        fetchArticle();
        fetchMostViewedArticles();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
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
            return date.toLocaleDateString('vi-VN');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-text-secondary">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-background-light py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">error</span>
                            <span>{error || 'Không tìm thấy bài viết'}</span>
                        </div>
                    </div>
                    <Link to="/" className="inline-block mt-4 text-primary hover:underline">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light text-[#111418] flex flex-col min-h-screen">
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Article Column (Left, 8 cols) */}
                    <article className="lg:col-span-8 flex flex-col gap-6">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap gap-2 text-sm">
                            <Link className="text-gray-500 hover:text-primary transition-colors" to="/">Trang chủ</Link>
                            <span className="text-gray-400">/</span>
                            {article.category && (
                                <>
                                    <Link className="text-gray-500 hover:text-primary transition-colors" to={`/?category=${article.category.slug}`}>
                                        {article.category.name}
                                    </Link>
                                    <span className="text-gray-400">/</span>
                                </>
                            )}
                            <span className="text-gray-900 font-medium truncate">{article.title}</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-gray-900 mt-2 font-display">
                            {article.title}
                        </h1>

                        {/* Profile/Meta Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12">
                                    <div className="rounded-full w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {(article.author?.displayName || article.author?.username)?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-gray-900">
                                        {article.author?.displayName || article.author?.username || 'Tác giả'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(article.publishedAt || article.createdAt)} • {article.views || 0} lượt xem
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-all">
                                    <span className="material-symbols-outlined text-[24px]">bookmark_add</span>
                                </button>
                                <button className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-all">
                                    <span className="material-symbols-outlined text-[24px]">share</span>
                                </button>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {article.thumbnail && (
                            <figure className="w-full my-2">
                                <img
                                    alt={article.title}
                                    className="w-full aspect-video object-cover rounded-xl shadow-sm"
                                    src={article.thumbnail}
                                />
                                <figcaption className="mt-3 text-center text-sm text-gray-500 italic font-sans">
                                    {article.title}
                                </figcaption>
                            </figure>
                        )}

                        {/* Content Body */}
                        <div className="article-content prose prose-lg prose-slate max-w-none font-display">
                            {article.excerpt && (
                                <p className="lead text-xl text-gray-600 mb-6 font-medium italic">
                                    {article.excerpt}
                                </p>
                            )}
                            <div
                                className="prose-headings:font-display prose-headings:font-bold
                                    prose-p:text-lg prose-p:leading-relaxed prose-p:text-gray-800
                                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-gray-900
                                    prose-img:rounded-lg prose-img:shadow-md
                                    prose-blockquote:border-l-primary prose-blockquote:bg-blue-50/50 
                                    prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                                    prose-code:text-primary prose-code:bg-gray-100 
                                    prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>

                        {/* Tags */}
                        {article.category && (
                            <div className="flex flex-wrap gap-2 mt-6 mb-8 font-sans">
                                <Link
                                    to={`/?category=${article.category.slug}`}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                                >
                                    #{article.category.name}
                                </Link>
                            </div>
                        )}

                        {/* Actions Bar (Sharing) */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-10">
                            <p className="text-sm font-bold text-gray-900 uppercase mb-4 text-center">Chia sẻ bài viết này</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                                    <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                                    <span className="text-sm font-bold">Facebook</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                                    <span className="text-sm font-bold">Twitter</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity">
                                    <span className="material-symbols-outlined text-[20px]">work</span>
                                    <span className="text-sm font-bold">LinkedIn</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">link</span>
                                    <span className="text-sm font-bold">Copy Link</span>
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="border-t border-gray-200 pt-10">
                            <CommentSection articleId={article._id} />
                        </div>
                    </article>

                    {/* Sidebar Column (Right, 4 cols) */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Trending/Latest News */}
                        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                                Xem Nhiều Nhất
                            </h3>
                            <div className="flex flex-col gap-0">
                                {mostViewedArticles.slice(0, 5).map((article, index) => (
                                    <Link key={article._id} to={`/article/${article.slug}`} className="group flex gap-4 py-3 border-b border-slate-100 last:border-0">
                                        <span className="text-3xl font-black text-slate-200 group-hover:text-primary transition-colors w-8 text-center leading-none">
                                            {index + 1}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-primary leading-snug">
                                                {article.title}
                                            </h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className="bg-transparent pt-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-5 border-l-4 border-red-500 pl-3 font-display">
                                    Tin liên quan
                                </h3>
                                <div className="grid gap-4">
                                    {relatedArticles.map((relatedArticle) => (
                                        <Link key={relatedArticle._id} to={`/article/${relatedArticle.slug}`} className="flex gap-3 group">
                                            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                                {relatedArticle.thumbnail ? (
                                                    <img
                                                        alt={relatedArticle.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        src={relatedArticle.thumbnail}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl">
                                                        📰
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-xs font-bold text-primary mb-1">
                                                    {relatedArticle.category?.name || 'Tin tức'}
                                                </span>
                                                <h4 className="text-sm font-bold text-gray-900 leading-tight font-display group-hover:text-primary transition-colors line-clamp-2">
                                                    {relatedArticle.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Newsletter */}
                        <div className="bg-blue-50 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-[24px]">mail</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">Đăng ký bản tin</h3>
                            <p className="text-sm text-gray-600 mb-4">Nhận những bài viết hay nhất mỗi sáng thứ Hai.</p>
                            <input
                                className="w-full mb-3 rounded-lg border-gray-300 text-sm py-2 px-3 focus:ring-primary focus:border-primary"
                                placeholder="Email của bạn"
                                type="email"
                            />
                            <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors text-sm">
                                Đăng ký ngay
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default ArticleDetail;
