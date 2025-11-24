const Article = require('../models/Article');

// @desc    Get all articles with search and filter
// @route   GET /api/articles?search=keyword&category=id&status=published&author=id
// @access  Public (published only) / Private (based on role)
exports.getArticles = async (req, res) => {
    try {
        let query = {};

        // Base query based on user role
        if (!req.user) {
            query.status = 'published';
        } else {
            // Admin and Editor can see all articles
            if (req.user.role === 'admin' || req.user.role === 'editor') {
                // No filter, show all
            } else if (req.user.role === 'author') {
                // Authors can only see their own articles or published articles
                query = {
                    $or: [
                        { author: req.user._id },
                        { status: 'published' }
                    ]
                };
            } else {
                // Readers can only see published articles
                query.status = 'published';
            }
        }

        // Search functionality - search only in title
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');

            // Combine with existing query
            if (query.$or) {
                // If query already has $or (for author role), combine with $and
                query = {
                    $and: [
                        { $or: query.$or },
                        { title: searchRegex }
                    ]
                };
            } else {
                // Otherwise, add search condition
                query.title = searchRegex;
            }
        }

        // Filter by category (using slug)
        if (req.query.category) {
            const Category = require('../models/Category');
            const category = await Category.findOne({ slug: req.query.category });
            if (category) {
                if (query.$and) {
                    query.$and.push({ category: category._id });
                } else {
                    query.category = category._id;
                }
            }
        }

        // Filter by author
        if (req.query.author) {
            if (query.$and) {
                query.$and.push({ author: req.query.author });
            } else {
                query.author = req.query.author;
            }
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count for pagination
        const total = await Article.countDocuments(query);

        // Execute query with pagination
        const articles = await Article.find(query)
            .populate('author', 'username email')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Pagination result
        const pagination = {
            current: page,
            limit: limit,
            total: total,
            pages: Math.ceil(total / limit)
        };

        res.status(200).json({
            success: true,
            count: articles.length,
            pagination: pagination,
            data: articles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public (published) / Private (own articles)
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username email role')
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check access permissions
        if (article.status !== 'published') {
            if (!req.user) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Only author, editor, or admin can view unpublished articles
            if (req.user.role === 'author' && article.author._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (req.user.role === 'reader') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        } else {
            // Increment views for published articles
            article.views += 1;
            await article.save();
        }

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single article by slug
// @route   GET /api/articles/slug/:slug
// @access  Public (published) / Private (own articles)
exports.getArticleBySlug = async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug })
            .populate('author', 'username email role')
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check access permissions
        if (article.status !== 'published') {
            if (!req.user) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Only author, editor, or admin can view unpublished articles
            if (req.user.role === 'author' && article.author._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (req.user.role === 'reader') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        } else {
            // Increment views for published articles
            article.views += 1;
            await article.save();
        }

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create article
// @route   POST /api/articles
// @access  Private/Author/Editor/Admin
exports.createArticle = async (req, res) => {
    try {
        const { title, content, excerpt, thumbnail, category } = req.body;

        const article = await Article.create({
            title,
            content,
            excerpt,
            thumbnail,
            category,
            author: req.user._id
        });

        const populatedArticle = await Article.findById(article._id)
            .populate('author', 'username email')
            .populate('category', 'name slug');

        res.status(201).json({
            success: true,
            data: populatedArticle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (own articles for authors, all for editor/admin)
exports.updateArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check permissions
        if (req.user.role === 'author' && article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this article'
            });
        }

        const { title, content, excerpt, thumbnail, category } = req.body;

        // Update fields
        if (title) article.title = title;
        if (content) article.content = content;
        if (excerpt) article.excerpt = excerpt;
        if (thumbnail !== undefined) article.thumbnail = thumbnail;
        if (category) article.category = category;

        await article.save();

        article = await Article.findById(article._id)
            .populate('author', 'username email')
            .populate('category', 'name slug');

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (own draft for authors, all for admin)
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check permissions
        if (req.user.role === 'author') {
            // Authors can only delete their own draft articles
            if (article.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this article'
                });
            }
            if (article.status !== 'draft') {
                return res.status(403).json({
                    success: false,
                    message: 'Can only delete draft articles'
                });
            }
        }

        await article.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Submit article for review (Author only)
// @route   PUT /api/articles/:id/submit
// @access  Private/Author
exports.submitArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check if user is the author
        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to submit this article'
            });
        }

        // Can only submit draft or rejected articles
        if (article.status !== 'draft' && article.status !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Can only submit draft or rejected articles'
            });
        }

        article.status = 'pending';
        await article.save();

        article = await Article.findById(article._id)
            .populate('author', 'username email')
            .populate('category', 'name slug');

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update article status (Editor/Admin only)
// @route   PUT /api/articles/:id/status
// @access  Private/Editor/Admin
exports.updateArticleStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Editor/Admin can only set these statuses
        if (!['approved', 'rejected', 'published'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Allowed: approved, rejected, published'
            });
        }

        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        article.status = status;
        await article.save();

        article = await Article.findById(article._id)
            .populate('author', 'username email')
            .populate('category', 'name slug');

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Publish article
// @route   PUT /api/articles/:id/publish
// @access  Private/Editor/Admin
exports.publishArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        article.status = 'published';
        await article.save();

        article = await Article.findById(article._id)
            .populate('author', 'username email')
            .populate('category', 'name slug');

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
