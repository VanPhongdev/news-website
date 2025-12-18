const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams để truy cập articleId từ parent router
const {
    getCommentsByArticle,
    createComment,
    updateComment,
    deleteComment,
    toggleLike
} = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');
const { canComment } = require('../middleware/role.middleware');

// Routes cho bình luận của một bài viết cụ thể
// Các routes này sẽ được mount tại /api/articles/:articleId/comments
router.route('/')
    .get(getCommentsByArticle)
    .post(protect, canComment, createComment);

// Routes cho từng bình luận riêng lẻ
// Các routes này sẽ được mount tại /api/comments/:id
router.route('/:id')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

// Route cho việc thích bình luận
router.post('/:id/like', protect, toggleLike);

module.exports = router;
