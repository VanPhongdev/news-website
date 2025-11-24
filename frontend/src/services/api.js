import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// User API
export const userAPI = {
    getUsers: () => api.get('/users'),
    getUser: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role })
};

// Category API
export const categoryAPI = {
    getCategories: () => api.get('/categories'),
    getCategory: (id) => api.get(`/categories/${id}`),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Article API
export const articleAPI = {
    getArticles: (params = {}) => api.get('/articles', { params }),
    getArticle: (id) => api.get(`/articles/${id}`),
    getArticleBySlug: (slug) => api.get(`/articles/slug/${slug}`),
    createArticle: (data) => api.post('/articles', data),
    updateArticle: (id, data) => api.put(`/articles/${id}`, data),
    deleteArticle: (id) => api.delete(`/articles/${id}`),
    submitArticle: (id) => api.put(`/articles/${id}/submit`), // For authors to submit for review
    updateArticleStatus: (id, status) => api.put(`/articles/${id}/status`, { status }),
    publishArticle: (id) => api.put(`/articles/${id}/publish`)
};

// Deletion Request API
export const deletionRequestAPI = {
    createRequest: (articleId, reason) => api.post('/deletion-requests', { article: articleId, reason }),
    getMyRequests: () => api.get('/deletion-requests/my-requests'),
    getAllRequests: (status) => api.get('/deletion-requests', { params: { status } }),
    approveRequest: (id) => api.patch(`/deletion-requests/${id}/approve`),
    rejectRequest: (id) => api.patch(`/deletion-requests/${id}/reject`)
};

// Comment API
export const commentAPI = {
    getCommentsByArticle: (articleId) => api.get(`/articles/${articleId}/comments`),
    createComment: (articleId, content) => api.post(`/articles/${articleId}/comments`, { content }),
    updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`)
};

export default api;
