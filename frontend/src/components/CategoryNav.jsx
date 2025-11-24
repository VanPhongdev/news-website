import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryAPI } from '../services/api';

const CategoryNav = () => {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');

    useEffect(() => {
        fetchCategories();

        // Polling: làm mới danh mục mỗi 30 giây
        const interval = setInterval(() => {
            fetchCategories();
        }, 30000);

        // Làm mới khi cửa sổ được focus
        const handleFocus = () => {
            fetchCategories();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    const handleHomeClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const buildCategoryUrl = (categorySlug) => {
        const params = new URLSearchParams(searchParams);
        if (categorySlug) {
            params.set('category', categorySlug);
        } else {
            params.delete('category');
        }
        // Reset về trang 1 khi chuyển category
        params.delete('page');
        const queryString = params.toString();
        return queryString ? `/?${queryString}` : '/';
    };

    return (
        <div className="category-nav">
            <div className="container">
                <div className="category-nav-content">
                    <Link
                        to={buildCategoryUrl(null)}
                        className={!activeCategory ? 'category-link active' : 'category-link'}
                        onClick={handleHomeClick}
                    >
                        🏠 Trang chủ
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            to={buildCategoryUrl(category.slug)}
                            className={activeCategory === category.slug ? 'category-link active' : 'category-link'}
                            onClick={handleHomeClick}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryNav;
