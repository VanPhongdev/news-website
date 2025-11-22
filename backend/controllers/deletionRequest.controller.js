const DeletionRequest = require('../models/DeletionRequest');
const Article = require('../models/Article');

// @desc    Create deletion request
// @route   POST /api/deletion-requests
// @access  Private (Author only)
exports.createRequest = async (req, res) => {
    try {
        const { article, reason } = req.body;

        // Check if article exists
        const articleDoc = await Article.findById(article);
        if (!articleDoc) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Check if user is the author of the article
        if (articleDoc.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only request deletion of your own articles'
            });
        }

        // Check if article is published
        if (articleDoc.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'You can only request deletion of published articles'
            });
        }

        // Check if there's already a pending request for this article
        const existingRequest = await DeletionRequest.findOne({
            article,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'There is already a pending deletion request for this article'
            });
        }

        // Create deletion request
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

// @desc    Get all deletion requests
// @route   GET /api/deletion-requests
// @access  Private (Admin/Editor only)
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

// @desc    Get my deletion requests
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

// @desc    Approve deletion request and delete article
// @route   PATCH /api/deletion-requests/:id/approve
// @access  Private (Admin/Editor only)
exports.approveRequest = async (req, res) => {
    try {
        const request = await DeletionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Deletion request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been reviewed'
            });
        }

        // Update request status
        request.status = 'approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();
        await request.save();

        // Delete the article
        await Article.findByIdAndDelete(request.article);

        const populatedRequest = await DeletionRequest.findById(request._id)
            .populate('article', 'title')
            .populate('author', 'username email')
            .populate('reviewedBy', 'username');

        res.status(200).json({
            success: true,
            message: 'Deletion request approved and article deleted',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject deletion request
// @route   PATCH /api/deletion-requests/:id/reject
// @access  Private (Admin/Editor only)
exports.rejectRequest = async (req, res) => {
    try {
        const request = await DeletionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Deletion request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been reviewed'
            });
        }

        // Update request status
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
            message: 'Deletion request rejected',
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
