const express = require('express');
const router = express.Router();
const {
    getArticles,
    getArticle,
    getArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle,
    submitArticle,
    updateArticleStatus,
    publishArticle
} = require('../controllers/article.controller');
const { protect } = require('../middleware/auth.middleware');
const { canWriteArticle, isEditorOrAdmin } = require('../middleware/role.middleware');

// Middleware để xác thực tùy chọn (cho getArticles và getArticle)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

// Routes public/xác thực tùy chọn
router.route('/')
    .get(optionalAuth, getArticles)
    .post(protect, canWriteArticle, createArticle);

// Route dựa trên slug (phải đặt trước /:id để tránh xung đột)
router.route('/slug/:slug')
    .get(optionalAuth, getArticleBySlug);

router.route('/:id')
    .get(optionalAuth, getArticle)
    .put(protect, canWriteArticle, updateArticle)
    .delete(protect, deleteArticle);

// Route cho Author - nộp bài để duyệt
router.route('/:id/submit')
    .put(protect, canWriteArticle, submitArticle);

// Routes chỉ dành cho Editor/Admin
router.route('/:id/status')
    .put(protect, isEditorOrAdmin, updateArticleStatus);

router.route('/:id/publish')
    .put(protect, isEditorOrAdmin, publishArticle);

module.exports = router;
