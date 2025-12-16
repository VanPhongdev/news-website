import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { articleAPI, categoryAPI } from '../services/api';

const HomePage = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const searchTerm = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || '';
    const currentPage = parseInt(searchParams.get('page'), 10) || 1;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchArticles();
        // Scroll to top when category or search changes
        window.scrollTo(0, 0);
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
                status: 'published'
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

    const getCurrentCategoryName = () => {
        if (!selectedCategory) return null;
        const category = categories.find(c => c.slug === selectedCategory);
        return category?.name;
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
            return date.toLocaleDateString('vi-VN');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased">
            <main className="layout-container flex h-full grow flex-col py-6 lg:py-8">
                <div className="px-4 lg:px-10 flex justify-center">
                    <div className="layout-content-container flex flex-col max-w-[1280px] flex-1 gap-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    <p className="mt-4 text-text-secondary">Đang tải bài viết...</p>
                                </div>
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-xl text-text-secondary mb-4">😔 Không tìm thấy bài viết nào</p>
                                {(searchTerm || selectedCategory) && (
                                    <Link to="/" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                        Xem tất cả bài viết
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Hero Section */}
                                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Main Hero Article */}
                                    {articles[0] && (
                                        <div className="lg:col-span-8 group cursor-pointer relative overflow-hidden rounded-xl">
                                            <Link to={`/article/${articles[0].slug}`} className="block w-full h-full min-h-[400px] bg-cover bg-center relative" style={{ backgroundImage: articles[0].thumbnail ? `url(${articles[0].thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                                <div className="absolute bottom-0 left-0 p-6 lg:p-8 flex flex-col gap-3">
                                                    <span className="inline-block px-3 py-1 rounded bg-primary text-white text-xs font-bold w-fit uppercase tracking-wider">
                                                        {articles[0].category?.name || 'Tin tức'}
                                                    </span>
                                                    <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight group-hover:text-primary transition-colors">
                                                        {articles[0].title}
                                                    </h1>
                                                    {articles[0].excerpt && (
                                                        <p className="text-gray-200 text-base lg:text-lg line-clamp-2 max-w-2xl">
                                                            {articles[0].excerpt}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-gray-300 text-sm mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                            {formatDate(articles[0].createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    )}

                                    {/* Side List (Right of Hero) */}
                                    <div className="lg:col-span-4 flex flex-col gap-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">trending_up</span>
                                            Tin Nổi Bật
                                        </h3>
                                        <div className="flex flex-col gap-3 h-full">
                                            {articles.slice(1, 4).map((article) => (
                                                <article key={article._id} className="flex gap-4 p-3 rounded-lg bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-[#283039] hover:border-primary/50 transition-all cursor-pointer group">
                                                    <Link to={`/article/${article.slug}`} className="w-24 h-24 shrink-0 bg-cover bg-center rounded-md" style={{ backgroundImage: article.thumbnail ? `url(${article.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></Link>
                                                    <div className="flex flex-col justify-between py-1">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-semibold text-primary">{article.category?.name || 'Tin tức'}</span>
                                                            <Link to={`/article/${article.slug}`}>
                                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary line-clamp-2">
                                                                    {article.title}
                                                                </h4>
                                                            </Link>
                                                        </div>
                                                        <span className="text-xs text-text-secondary">{formatDate(article.createdAt)}</span>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Main Content Body */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                                    {/* Left Column: News Feed */}
                                    <div className="lg:col-span-8 flex flex-col gap-8">
                                        {/* Latest News Grid */}
                                        <div>
                                            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-[#283039] pb-3">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white relative">
                                                    Tin Mới Nhất
                                                    <span className="absolute bottom-[-13px] left-0 w-full h-[3px] bg-primary rounded-t-full"></span>
                                                </h2>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {articles.slice(4, 8).map((article) => (
                                                    <div key={article._id} className="flex flex-col gap-3 group cursor-pointer">
                                                        <Link to={`/article/${article.slug}`} className="w-full aspect-video bg-cover bg-center rounded-lg overflow-hidden relative" style={{ backgroundImage: article.thumbnail ? `url(${article.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                                        </Link>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-primary uppercase">{article.category?.name || 'Tin tức'}</span>
                                                                <span className="text-xs text-text-secondary">• {formatDate(article.createdAt)}</span>
                                                            </div>
                                                            <Link to={`/article/${article.slug}`}>
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                                                                    {article.title}
                                                                </h3>
                                                            </Link>
                                                            {article.excerpt && (
                                                                <p className="text-slate-600 dark:text-text-secondary text-sm line-clamp-2">
                                                                    {article.excerpt}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Remaining Articles */}
                                        {articles.length > 8 && (
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-l-4 border-primary pl-3">
                                                    Bài viết khác
                                                </h2>
                                                <div className="flex flex-col gap-4">
                                                    {articles.slice(8).map((article) => (
                                                        <div key={article._id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-[#283039] hover:shadow-md transition-all group cursor-pointer">
                                                            <Link to={`/article/${article.slug}`} className="w-full sm:w-48 aspect-video sm:aspect-[4/3] bg-cover bg-center rounded-lg shrink-0" style={{ backgroundImage: article.thumbnail ? `url(${article.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></Link>
                                                            <div className="flex flex-col justify-center gap-2">
                                                                <span className="text-xs font-bold text-primary">{article.category?.name || 'Tin tức'}</span>
                                                                <Link to={`/article/${article.slug}`}>
                                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                                        {article.title}
                                                                    </h3>
                                                                </Link>
                                                                {article.excerpt && (
                                                                    <p className="text-slate-600 dark:text-text-secondary text-sm line-clamp-2">
                                                                        {article.excerpt}
                                                                    </p>
                                                                )}
                                                                <span className="text-xs text-text-secondary mt-1">{formatDate(article.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Sidebar */}
                                    <aside className="lg:col-span-4 flex flex-col gap-8">
                                        {/* Most Viewed List */}
                                        <div className="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-100 dark:border-[#283039] shadow-sm">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                                                Xem Nhiều Nhất
                                            </h3>
                                            <div className="flex flex-col gap-0">
                                                {articles.slice(0, 5).map((article, index) => (
                                                    <Link key={article._id} to={`/article/${article.slug}`} className="group flex gap-4 py-3 border-b border-slate-100 dark:border-[#283039]/50 last:border-0">
                                                        <span className="text-3xl font-black text-slate-200 dark:text-[#283039] group-hover:text-primary transition-colors w-8 text-center leading-none">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex flex-col gap-1">
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary leading-snug">
                                                                {article.title}
                                                            </h4>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Newsletter Box */}
                                        <div className="bg-slate-100 dark:bg-[#1e293b] rounded-xl p-6 text-center">
                                            <span className="material-symbols-outlined text-4xl text-primary mb-3 inline-block">mail</span>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Đừng bỏ lỡ tin hay!</h3>
                                            <p className="text-sm text-text-secondary mb-4">Nhận bản tin tổng hợp mỗi sáng.</p>
                                            <input
                                                className="w-full mb-3 px-4 py-2 rounded-lg bg-white dark:bg-[#101922] border border-slate-200 dark:border-none text-sm focus:ring-1 focus:ring-primary outline-none"
                                                placeholder="Email của bạn"
                                                type="email"
                                            />
                                            <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                                                Đăng Ký
                                            </button>
                                        </div>
                                    </aside>
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.pages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-8">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ← Trang trước
                                        </button>
                                        <div className="flex gap-2">
                                            {[...Array(pagination.pages)].map((_, index) => {
                                                const pageNum = index + 1;
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === pagination.pages ||
                                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`min-w-[40px] px-3 py-2 rounded-lg transition-colors ${pageNum === currentPage
                                                                ? 'bg-primary text-white'
                                                                : 'border border-primary text-primary hover:bg-primary hover:text-white'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                    return <span key={pageNum} className="px-2 text-text-secondary">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === pagination.pages}
                                            className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trang sau →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
