const Article = require('../models/Article');

// @desc    Lấy tất cả bài viết với tìm kiếm và lọc
// @route   GET /api/articles?search=keyword&category=id&status=published&author=id
// @access  Public (chỉ published) / Private (dựa trên role)
exports.getArticles = async (req, res) => {
    try {
        let query = {};

        // Query cơ bản dựa trên vai trò người dùng
        if (!req.user) {
            query.status = 'published';
        } else {
            // Admin và Editor có thể xem bài pending, approved và published (Không bao gồm draft)
            if (req.user.role === 'admin' || req.user.role === 'editor') {
                query.status = { $in: ['pending', 'approved', 'published'] };
            } else if (req.user.role === 'author') {
                // Author chỉ có thể xem bài của mình hoặc bài published
                query = {
                    $or: [
                        { author: req.user._id },
                        { status: 'published' }
                    ]
                };
            } else {
                // Reader chỉ có thể xem bài published
                query.status = 'published';
            }
        }

        // Chức năng tìm kiếm - chỉ tìm trong tiêu đề
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');

            // Kết hợp với query hiện tại
            if (query.$or) {
                // Nếu query đã có $or (cho role author), kết hợp với $and
                query = {
                    $and: [
                        { $or: query.$or },
                        { title: searchRegex }
                    ]
                };
            } else {
                // Ngược lại, thêm điều kiện tìm kiếm
                query.title = searchRegex;
            }
        }

        // Lọc theo chuyên mục (sử dụng slug)
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

        // Lọc theo tác giả
        if (req.query.author) {
            if (query.$and) {
                query.$and.push({ author: req.query.author });
            } else {
                query.author = req.query.author;
            }
        }

        // Phân trang
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Lấy tổng số bài viết cho phân trang
        const total = await Article.countDocuments(query);

        // Thực thi query với phân trang
        const articles = await Article.find(query)
            .populate('author', 'username email')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Kết quả phân trang
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

// @desc    Lấy một bài viết theo ID
// @route   GET /api/articles/:id
// @access  Public (published) / Private (bài viết của mình)
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username email role')
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Kiểm tra quyền truy cập
        if (article.status !== 'published') {
            if (!req.user) {
                return res.status(403).json({
                    success: false,
                    message: 'Truy cập bị từ chối'
                });
            }

            // Bài viết draft: chỉ tác giả mới xem được
            if (article.status === 'draft') {
                if (article.author._id.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Truy cập bị từ chối'
                    });
                }
            } else {
                // Bài viết Pending/Approved: tác giả, editor hoặc admin có thể xem
                if (req.user.role === 'author' && article.author._id.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Truy cập bị từ chối'
                    });
                }

                if (req.user.role === 'reader') {
                    return res.status(403).json({
                        success: false,
                        message: 'Truy cập bị từ chối'
                    });
                }
            }
        } else {
            // Tăng lượt xem cho bài viết published
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

// @desc    Lấy một bài viết theo slug
// @route   GET /api/articles/slug/:slug
// @access  Public (published) / Private (bài viết của mình)
exports.getArticleBySlug = async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug })
            .populate('author', 'username email role')
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Kiểm tra quyền truy cập
        if (article.status !== 'published') {
            if (!req.user) {
                return res.status(403).json({
                    success: false,
                    message: 'Truy cập bị từ chối'
                });
            }

            // Bài viết draft: chỉ tác giả mới xem được
            if (article.status === 'draft') {
                if (article.author._id.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Truy cập bị từ chối'
                    });
                }
            } else {
                // Bài viết Pending/Approved: tác giả, editor hoặc admin có thể xem
                if (req.user.role === 'author' && article.author._id.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Truy cập bị từ chối'
                    });
                }

                if (req.user.role === 'reader') {
                    return res.status(403).json({
                        success: false,
                        message: 'Truy cập bị từ chối'
                    });
                }
            }
        } else {
            // Tăng lượt xem cho bài viết published
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

// @desc    Tạo bài viết mới
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

// @desc    Cập nhật bài viết
// @route   PUT /api/articles/:id
// @access  Private (bài của mình cho author, tất cả cho editor/admin)
exports.updateArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (req.user.role === 'author' && article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật bài viết'
            });
        }

        const { title, content, excerpt, thumbnail, category } = req.body;

        // Cập nhật các trường
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

// @desc    Xóa bài viết
// @route   DELETE /api/articles/:id
// @access  Private (draft của mình cho author, tất cả cho admin)
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (req.user.role === 'author') {
            // Author chỉ có thể xóa bài draft của mình (bài rejected tự động chuyển về draft)
            if (article.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this article'
                });
            }
            if (article.status !== 'draft') {
                return res.status(403).json({
                    success: false,
                    message: 'Chỉ có thể xóa bài viết nháp'
                });
            }
        }

        await article.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa bài viết thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Nộp bài để duyệt (Chỉ Author)
// @route   PUT /api/articles/:id/submit
// @access  Private/Author
exports.submitArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Kiểm tra xem user có phải là tác giả không
        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền nộp bài viết'
            });
        }

        // Chỉ có thể nộp bài draft (bài rejected tự động chuyển về draft)
        if (article.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể nộp bài viết nháp'
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

// @desc    Cập nhật trạng thái bài viết (Chỉ Editor/Admin)
// @route   PUT /api/articles/:id/status
// @access  Private/Editor/Admin
exports.updateArticleStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Editor/Admin chỉ có thể set các trạng thái này
        if (!['approved', 'rejected', 'published'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ. Chỉ được phép: approved, rejected, published'
            });
        }

        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Khi rejected, tự động chuyển về draft để tác giả có thể sửa và nộp lại
        article.status = status === 'rejected' ? 'draft' : status;
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

// @desc    Đăng bài viết
// @route   PUT /api/articles/:id/publish
// @access  Private/Editor/Admin
exports.publishArticle = async (req, res) => {
    try {
        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
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
