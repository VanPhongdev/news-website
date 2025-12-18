const Comment = require('../models/Comment');
const Article = require('../models/Article');

// @desc    Lấy tất cả bình luận của một bài viết
// @route   GET /api/articles/:articleId/comments
// @access  Public
exports.getCommentsByArticle = async (req, res) => {
    try {
        const { articleId } = req.params;

        // Kiểm tra xem bài viết có tồn tại không
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Chỉ lấy bình luận cấp cao nhất (parent là null)
        const comments = await Comment.find({ article: articleId, parent: null })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        // Hàm đệ quy để lấy tất cả các câu trả lời lồng nhau
        const getRepliesRecursive = async (commentId) => {
            const replies = await Comment.find({ parent: commentId })
                .populate('author', 'username')
                .sort({ createdAt: 1 });

            // Với mỗi câu trả lời, lấy các câu trả lời lồng nhau của nó
            const repliesWithNested = await Promise.all(
                replies.map(async (reply) => {
                    const nestedReplies = await getRepliesRecursive(reply._id);
                    return {
                        ...reply.toObject(),
                        replies: nestedReplies,
                        likesCount: reply.likes.length
                    };
                })
            );

            return repliesWithNested;
        };

        // Với mỗi bình luận, lấy các câu trả lời đệ quy
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await getRepliesRecursive(comment._id);

                return {
                    ...comment.toObject(),
                    replies,
                    likesCount: comment.likes.length
                };
            })
        );

        res.status(200).json({
            success: true,
            count: commentsWithReplies.length,
            data: commentsWithReplies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Tạo bình luận
// @route   POST /api/articles/:articleId/comments
// @access  Private (Chỉ Reader và Author)
exports.createComment = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { content, parent } = req.body;

        // Kiểm tra xem bài viết có tồn tại và đã được đăng chưa
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        if (article.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Không thể bình luận trên bài viết chưa được đăng'
            });
        }

        // Tạo bình luận (với parent tùy chọn cho câu trả lời)
        const comment = await Comment.create({
            content,
            article: articleId,
            author: req.user._id,
            parent: parent || null
        });

        // Populate thông tin tác giả
        await comment.populate('author', 'username');

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Cập nhật bình luận
// @route   PUT /api/comments/:id
// @access  Private (Chỉ chủ bình luận)
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        let comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Bình luận không tồn tại'
            });
        }

        // Kiểm tra xem user có phải là chủ bình luận không
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật bình luận'
            });
        }

        comment.content = content;
        await comment.save();

        await comment.populate('author', 'username');

        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Xóa bình luận
// @route   DELETE /api/comments/:id
// @access  Private (Chủ bình luận hoặc Admin)
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Bình luận không tồn tại'
            });
        }

        // Kiểm tra xem user có phải là chủ bình luận hoặc admin không
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa bình luận'
            });
        }

        // Hàm đệ quy để xóa tất cả các câu trả lời lồng nhau
        const deleteRepliesRecursive = async (commentId) => {
            const replies = await Comment.find({ parent: commentId });

            for (const reply of replies) {
                // Xóa các câu trả lời lồng nhau của câu trả lời này
                await deleteRepliesRecursive(reply._id);
                // Xóa chính câu trả lời
                await reply.deleteOne();
            }
        };

        // Xóa tất cả các câu trả lời lồng nhau trước
        await deleteRepliesRecursive(comment._id);

        // Xóa chính bình luận
        await comment.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Bật/tắt thích bình luận
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Bình luận không tồn tại'
            });
        }

        // Kiểm tra xem user đã thích bình luận chưa
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike: xóa user khỏi mảng likes
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like: thêm user vào mảng likes
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            success: true,
            data: {
                likesCount: comment.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};
