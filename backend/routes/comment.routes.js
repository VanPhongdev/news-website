const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access articleId from parent router
const {
    getCommentsByArticle,
    createComment,
    updateComment,
    deleteComment,
    toggleLike
} = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');
const { canComment } = require('../middleware/role.middleware');

// Routes for comments on a specific article
// These will be mounted at /api/articles/:articleId/comments
router.route('/')
    .get(getCommentsByArticle)
    .post(protect, canComment, createComment);

// Routes for individual comments
// These will be mounted at /api/comments/:id
router.route('/:id')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

// Route for liking a comment
router.post('/:id/like', protect, toggleLike);

module.exports = router;
