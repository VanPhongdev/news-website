const DeletionRequest = require('../models/DeletionRequest');
const Article = require('../models/Article');

// @desc    Tạo yêu cầu xóa
// @route   POST /api/deletion-requests
// @access  Private (Chỉ Author)
exports.createRequest = async (req, res) => {
    try {
        const { article, reason } = req.body;

        // Kiểm tra xem bài viết có tồn tại không
        const articleDoc = await Article.findById(article);
        if (!articleDoc) {
            return res.status(404).json({
                success: false,
                message: 'Bài viết không tồn tại'
            });
        }

        // Kiểm tra xem user có phải là tác giả của bài viết không
        if (articleDoc.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chỉ có thể yêu cầu xóa bài viết của mình'
            });
        }

        // Kiểm tra xem bài viết đã được đăng chưa
        if (articleDoc.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Bạn chỉ có thể yêu cầu xóa bài viết đã được đăng'
            });
        }

        // Kiểm tra xem đã có yêu cầu pending cho bài viết này chưa
        const existingRequest = await DeletionRequest.findOne({
            article,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã yêu cầu xóa bài viết này'
            });
        }

        // Tạo yêu cầu xóa
        const deletionRequest = await DeletionRequest.create({
            article,
            author: req.user._id,
            reason
        });

        const populatedRequest = await DeletionRequest.findById(deletionRequest._id)
            .populate('article', 'title')
            .populate('author', 'username email');

        res.status(201).json({
            success: true,
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy tất cả yêu cầu xóa
// @route   GET /api/deletion-requests
// @access  Private (Chỉ Admin/Editor)
exports.getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await DeletionRequest.find(filter)
            .populate('article', 'title slug')
            .populate('author', 'username email')
            .populate('reviewedBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy yêu cầu xóa của tôi
// @route   GET /api/deletion-requests/my-requests
// @access  Private (Author)
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await DeletionRequest.find({ author: req.user._id })
            .populate('article', 'title slug status')
            .populate('reviewedBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Chấp nhận yêu cầu xóa và xóa bài viết
// @route   PATCH /api/deletion-requests/:id/approve
// @access  Private (Chỉ Admin/Editor)
exports.approveRequest = async (req, res) => {
    try {
        const request = await DeletionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Yêu cầu xóa không tồn tại'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu này đã được xem xét'
            });
        }

        // Cập nhật trạng thái yêu cầu
        request.status = 'approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();
        await request.save();

        // Xóa bài viết
        await Article.findByIdAndDelete(request.article);

        const populatedRequest = await DeletionRequest.findById(request._id)
            .populate('article', 'title')
            .populate('author', 'username email')
            .populate('reviewedBy', 'username');

        res.status(200).json({
            success: true,
            message: 'Yêu cầu xóa được chấp nhận và bài viết đã được xóa',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Từ chối yêu cầu xóa
// @route   PATCH /api/deletion-requests/:id/reject
// @access  Private (Chỉ Admin/Editor)
exports.rejectRequest = async (req, res) => {
    try {
        const request = await DeletionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Yêu cầu xóa không tồn tại'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu này đã được xem xét'
            });
        }

        // Cập nhật trạng thái yêu cầu
        request.status = 'rejected';
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();
        await request.save();

        const populatedRequest = await DeletionRequest.findById(request._id)
            .populate('article', 'title')
            .populate('author', 'username email')
            .populate('reviewedBy', 'username');

        res.status(200).json({
            success: true,
            message: 'Yêu cầu xóa bị từ chối',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
