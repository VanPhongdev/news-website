import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.data);
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const response = await authAPI.login({ username, password });
        const { token, ...userData } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return userData; // Trả về dữ liệu user để chuyển hướng theo role
    };

    const register = async (displayName, username, email, password, role = 'reader') => {
        const response = await authAPI.register({ displayName, username, email, password, role });
        const { token, ...userData } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return userData; // Trả về dữ liệu user để chuyển hướng theo role
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isEditor: user?.role === 'editor',
        isAuthor: user?.role === 'author',
        isReader: user?.role === 'reader'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
