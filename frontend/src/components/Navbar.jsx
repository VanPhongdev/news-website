import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    useEffect(() => {
        // Đồng bộ từ khóa tìm kiếm với URL params
        const urlSearch = searchParams.get('search');
        if (urlSearch !== searchTerm) {
            setSearchTerm(urlSearch || '');
        }
    }, [searchParams]);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Xóa timeout trước đó
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Debounce tìm kiếm - cập nhật URL sau 500ms
        const timeout = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (value) {
                newParams.set('search', value);
            } else {
                newParams.delete('search');
            }
            // Reset về trang 1 khi tìm kiếm
            newParams.delete('page');
            // Giữ param chuyên mục nếu có
            setSearchParams(newParams);
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Clear all search params and navigate to home
        setSearchParams({});
        setSearchTerm('');
        navigate('/');
    };

    return (
        <div className="navbar">
            <div className="container navbar-content">
                <Link to="/" onClick={handleLogoClick}>
                    <h1>📰Today News</h1>
                </Link>
                <div className="navbar-right">
                    <div className="navbar-search">
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    <nav>
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login">Đăng nhập</Link>
                                <Link to="/register">Đăng ký</Link>
                            </>
                        ) : (
                            <>
                                {user.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
                                {user.role === 'editor' && <Link to="/editor">Editor Dashboard</Link>}
                                {user.role === 'author' && <Link to="/author">Author Dashboard</Link>}
                                <span>Xin chào, {user.username}</span>
                                <button onClick={handleLogout}>Đăng xuất</button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
