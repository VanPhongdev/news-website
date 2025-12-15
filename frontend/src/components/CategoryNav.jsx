import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryAPI } from '../services/api';

const CategoryNav = () => {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.data.data);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    // Icon mapping for categories
    const categoryIcons = {
        'thoi-su': 'newspaper',
        'kinh-te': 'trending_up',
        'cong-nghe': 'computer',
        'the-thao': 'sports_soccer',
        'giai-tri': 'movie',
        'doi-song': 'favorite',
        'default': 'article'
    };

    const getCategoryIcon = (slug) => {
        return categoryIcons[slug] || categoryIcons['default'];
    };

    return (
        <div className="bg-white dark:bg-background-dark border-b border-slate-200 dark:border-[#283039] sticky top-[61px] z-40">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-10">
                <div className="flex gap-2 py-3 overflow-x-auto scrollbar-thin">
                    <Link
                        to="/"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-dark'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">home</span>
                        Tất cả
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/?category=${category.slug}`}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category.slug
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-surface-dark'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {getCategoryIcon(category.slug)}
                            </span>
                            {category.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryNav;
