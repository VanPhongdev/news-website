import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { articleAPI, categoryAPI } from '../services/api';

const HomePage = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy từ khóa tìm kiếm, chuyên mục và trang từ URL params
    const searchTerm = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || '';
    const currentPage = parseInt(searchParams.get('page'), 10) || 1;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [currentPage, searchTerm, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                status: 'published' // Chỉ hiển thị bài viết đã đăng trên trang chủ
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (selectedCategory) {
                params.category = selectedCategory;
            }

            const response = await articleAPI.getArticles(params);
            setArticles(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Lỗi khi tải bài viết:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        if (newPage === 1) {
            newParams.delete('page');
        } else {
            newParams.set('page', newPage);
        }
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lấy tên chuyên mục hiện tại để hiển thị
    const getCurrentCategoryName = () => {
        if (!selectedCategory) return null;
        const category = categories.find(c => c.slug === selectedCategory);
        return category?.name;
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Page Title */}
            <h2>
                {searchTerm && selectedCategory && `Tìm kiếm "${searchTerm}" trong ${getCurrentCategoryName()}`}
                {searchTerm && !selectedCategory && `Kết quả tìm kiếm: "${searchTerm}"`}
                {!searchTerm && selectedCategory && getCurrentCategoryName()}
                {!searchTerm && !selectedCategory && 'Tin tức mới nhất'}
            </h2>

            {/* Results Info */}
            {pagination && (
                <div style={{
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    color: '#666',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                }}>
                    Hiển thị {articles.length} / {pagination.total} bài viết
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="loading">Đang tải bài viết...</div>
            ) : articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <p style={{ fontSize: '1.2rem' }}>😔 Không tìm thấy bài viết nào</p>
                    {(searchTerm || selectedCategory) && (
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                            Xem tất cả bài viết
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Article List with New Layout */}
                    <div className="articles-container">
                        {articles.length > 0 && (
                            <>
                                {/* Featured Article (Latest - Top Left) */}
                                <div className="featured-article">
                                    <Link to={`/article/${articles[0].slug}`} className="featured-article-image">
                                        {articles[0].thumbnail ? (
                                            <img src={articles[0].thumbnail} alt={articles[0].title} />
                                        ) : (
                                            <div className="no-image">📰</div>
                                        )}
                                    </Link>
                                    <div className="featured-article-content">
                                        <h2>
                                            <Link to={`/article/${articles[0].slug}`}>{articles[0].title}</Link>
                                        </h2>
                                        <div className="article-meta">
                                            <span>{articles[0].category?.name}</span>
                                            {' • '}
                                            <span>{new Date(articles[0].createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        {articles[0].excerpt && (
                                            <p className="article-excerpt">{articles[0].excerpt}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Right Articles (2nd to 5th articles) */}
                                {articles.length > 1 && (
                                    <div className="top-right-articles">
                                        {articles.slice(1, 5).map((article) => (
                                            <div key={article._id} className="article-card">
                                                <Link to={`/article/${article.slug}`} className="article-card-image">
                                                    {article.thumbnail ? (
                                                        <img src={article.thumbnail} alt={article.title} />
                                                    ) : (
                                                        <div className="no-image">📰</div>
                                                    )}
                                                </Link>
                                                <div className="article-card-content">
                                                    <h3>
                                                        <Link to={`/article/${article.slug}`}>{article.title}</Link>
                                                    </h3>
                                                    <div className="article-meta">
                                                        <span>{article.category?.name}</span>
                                                        {' • '}
                                                        <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    {article.excerpt && (
                                                        <p className="article-excerpt">{article.excerpt}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Remaining Articles (6th article onwards - Below, 2 columns) */}
                                {articles.length > 5 && (
                                    <div className="remaining-articles">
                                        {articles.slice(5).map((article) => (
                                            <div key={article._id} className="article-card">
                                                <Link to={`/article/${article.slug}`} className="article-card-image">
                                                    {article.thumbnail ? (
                                                        <img src={article.thumbnail} alt={article.title} />
                                                    ) : (
                                                        <div className="no-image">📰</div>
                                                    )}
                                                </Link>
                                                <div className="article-card-content">
                                                    <h3>
                                                        <Link to={`/article/${article.slug}`}>{article.title}</Link>
                                                    </h3>
                                                    <div className="article-meta">
                                                        <span>{article.category?.name}</span>
                                                        {' • '}
                                                        <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    {article.excerpt && (
                                                        <p className="article-excerpt">{article.excerpt}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginTop: '2rem',
                            padding: '1rem'
                        }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="btn btn-secondary"
                                style={{
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                ← Trang trước
                            </button>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {[...Array(pagination.pages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    // Hiển thị trang đầu, trang cuối, trang hiện tại và các trang xung quanh
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.pages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={pageNum === currentPage ? 'btn btn-primary' : 'btn btn-secondary'}
                                                style={{
                                                    minWidth: '40px',
                                                    fontWeight: pageNum === currentPage ? 'bold' : 'normal'
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum}>...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.pages}
                                className="btn btn-secondary"
                                style={{
                                    opacity: currentPage === pagination.pages ? 0.5 : 1,
                                    cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Trang sau →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HomePage;
