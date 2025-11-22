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

    return (
        <div className="category-nav">
            <div className="container">
                <div className="category-nav-content">
                    <Link
                        to="/"
                        className={!activeCategory ? 'category-link active' : 'category-link'}
                    >
                        🏠 Trang chủ
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/?category=${category._id}`}
                            className={activeCategory === category._id ? 'category-link active' : 'category-link'}
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
