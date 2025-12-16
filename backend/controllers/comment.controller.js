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

        // Get only top-level comments (parent is null)
        const comments = await Comment.find({ article: articleId, parent: null })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        // Recursive function to get all nested replies
        const getRepliesRecursive = async (commentId) => {
            const replies = await Comment.find({ parent: commentId })
                .populate('author', 'username')
                .sort({ createdAt: 1 });

            // For each reply, get its nested replies
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

        // For each comment, get its replies recursively
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

// @desc    Create a comment
// @route   POST /api/articles/:articleId/comments
// @access  Private (Reader and Author only)
exports.createComment = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { content, parent } = req.body;

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

        // Create comment (with optional parent for replies)
        const comment = await Comment.create({
            content,
            article: articleId,
            author: req.user._id,
            parent: parent || null
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

        // Recursive function to delete all nested replies
        const deleteRepliesRecursive = async (commentId) => {
            const replies = await Comment.find({ parent: commentId });

            for (const reply of replies) {
                // Delete nested replies of this reply
                await deleteRepliesRecursive(reply._id);
                // Delete the reply itself
                await reply.deleteOne();
            }
        };

        // Delete all nested replies first
        await deleteRepliesRecursive(comment._id);

        // Delete the comment itself
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

// @desc    Toggle like on a comment
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
                message: 'Comment not found'
            });
        }

        // Check if user already liked the comment
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike: remove user from likes array
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like: add user to likes array
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
