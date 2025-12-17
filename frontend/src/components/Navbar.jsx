import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryAPI } from '../services/api';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [categories, setCategories] = useState([]);
    const [visibleCategories, setVisibleCategories] = useState([]);
    const [dropdownCategories, setDropdownCategories] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navRef = useRef(null);
    const selectedCategory = searchParams.get('category') || '';

    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch !== searchTerm) {
            setSearchTerm(urlSearch || '');
        }
    }, [searchParams]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            calculateVisibleCategories();
        }
    }, [categories]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    const calculateVisibleCategories = () => {
        // On large screens, show first 6 categories, rest in dropdown
        // On medium screens, show first 3 categories
        const screenWidth = window.innerWidth;
        let maxVisible = 6;

        if (screenWidth < 1280) {
            maxVisible = 3;
        }

        setVisibleCategories(categories.slice(0, maxVisible));
        setDropdownCategories(categories.slice(maxVisible));
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (value) {
                newParams.set('search', value);
            } else {
                newParams.delete('search');
            }
            newParams.delete('page');
            setSearchParams(newParams);
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSearchParams({});
        setSearchTerm('');
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light bg-white backdrop-blur px-4 lg:px-10 py-3 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Logo */}
                <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 shrink-0">
                    <div className="size-8 text-primary">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h8v6H6V8zm2 2v2h4v-2H8zm-2 6h12v2H6v-2zm10-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                        </svg>
                    </div>
                    <h2 className="text-text-primary text-xl font-bold leading-tight tracking-[-0.015em]">
                        TinTức<span className="text-primary">24h</span>
                    </h2>
                </Link>

                {/* Categories Navigation */}
                <nav ref={navRef} className="hidden lg:flex items-center gap-4 xl:gap-6">
                    <Link
                        className={`text-sm font-medium leading-normal transition-colors ${!selectedCategory
                            ? 'text-primary font-bold border-b-2 border-primary'
                            : 'text-text-secondary hover:text-primary'
                            }`}
                        to="/"
                    >
                        Trang chủ
                    </Link>
                    {visibleCategories.map((category) => (
                        <Link
                            key={category._id}
                            className={`text-sm font-medium leading-normal transition-colors ${selectedCategory === category.slug
                                ? 'text-primary font-bold border-b-2 border-primary'
                                : 'text-text-secondary hover:text-primary'
                                }`}
                            to={`/?category=${category.slug}`}
                        >
                            {category.name}
                        </Link>
                    ))}
                    {dropdownCategories.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                            >
                                Thêm
                                <span className="material-symbols-outlined text-[18px]">
                                    {showDropdown ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>
                            {showDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowDropdown(false)}
                                    ></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-border-light rounded-lg shadow-lg py-2 z-50">
                                        {dropdownCategories.map((category) => (
                                            <Link
                                                key={category._id}
                                                to={`/?category=${category.slug}`}
                                                onClick={() => setShowDropdown(false)}
                                                className={`block px-4 py-2 text-sm transition-colors ${selectedCategory === category.slug
                                                    ? 'bg-primary text-white'
                                                    : 'text-text-secondary hover:bg-surface-light'
                                                    }`}
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </nav>
            </div>

            {/* Right Side - Search and Auth */}
            <div className="flex items-center gap-4">
                <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-surface-light border border-border-light focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="text-text-secondary flex items-center justify-center pl-4 pr-2">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-transparent text-text-primary focus:outline-0 focus:ring-0 border-none h-full placeholder:text-text-secondary px-0 text-sm font-normal leading-normal"
                            placeholder="Tìm kiếm tin tức..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </label>
                {!isAuthenticated ? (
                    <Link to="/login">
                        <button className="flex min-w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm">
                            <span className="truncate">Đăng nhập</span>
                        </button>
                    </Link>
                ) : (
                    <div className="flex items-center gap-4">
                        {user.role === 'admin' && (
                            <Link className="text-text-secondary hover:text-primary text-sm font-medium" to="/admin">
                                Admin
                            </Link>
                        )}
                        {user.role === 'editor' && (
                            <Link className="text-text-secondary hover:text-primary text-sm font-medium" to="/editor">
                                Editor
                            </Link>
                        )}
                        {user.role === 'author' && (
                            <Link className="text-text-secondary hover:text-primary text-sm font-medium" to="/author">
                                Author
                            </Link>
                        )}
                        <span className="text-text-secondary text-sm">Xin chào, {user.username}</span>
                        <button
                            onClick={handleLogout}
                            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-light hover:bg-border-light transition-colors text-text-primary text-sm font-medium"
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
