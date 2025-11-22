const express = require('express');
const router = express.Router();
const {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    submitArticle,
    updateArticleStatus,
    publishArticle
} = require('../controllers/article.controller');
const { protect } = require('../middleware/auth.middleware');
const { canWriteArticle, isEditorOrAdmin } = require('../middleware/role.middleware');

// Middleware to optionally authenticate (for getArticles and getArticle)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

// Public/Optional auth routes
router.route('/')
    .get(optionalAuth, getArticles)
    .post(protect, canWriteArticle, createArticle);

router.route('/:id')
    .get(optionalAuth, getArticle)
    .put(protect, canWriteArticle, updateArticle)
    .delete(protect, deleteArticle);

// Author route - submit article for review
router.route('/:id/submit')
    .put(protect, canWriteArticle, submitArticle);

// Editor/Admin only routes
router.route('/:id/status')
    .put(protect, isEditorOrAdmin, updateArticleStatus);

router.route('/:id/publish')
    .put(protect, isEditorOrAdmin, publishArticle);

module.exports = router;
