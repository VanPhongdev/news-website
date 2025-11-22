const Comment = require('../models/Comment');
const Article = require('../models/Article');

// @desc    Get all comments for an article
// @route   GET /api/articles/:articleId/comments
// @access  Public
exports.getCommentsByArticle = async (req, res) => {
    try {
        const { articleId } = req.params;

        // Check if article exists
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        const comments = await Comment.find({ article: articleId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Create a comment
// @route   POST /api/articles/:articleId/comments
// @access  Private (Reader and Author only)
exports.createComment = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { content } = req.body;

        // Check if article exists and is published
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        if (article.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Cannot comment on unpublished articles'
            });
        }

        // Create comment
        const comment = await Comment.create({
            content,
            article: articleId,
            author: req.user._id
        });

        // Populate author information
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

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Comment owner only)
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        let comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is the comment owner
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
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

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment owner or Admin)
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is the comment owner or admin
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

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
