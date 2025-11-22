const express = require('express');
const router = express.Router();
const {
    createRequest,
    getRequests,
    getMyRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/deletionRequest.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Author routes
router.post('/', protect, authorize('author', 'editor', 'admin'), createRequest);
router.get('/my-requests', protect, authorize('author', 'editor', 'admin'), getMyRequests);

// Admin/Editor routes
router.get('/', protect, authorize('admin', 'editor'), getRequests);
router.patch('/:id/approve', protect, authorize('admin', 'editor'), approveRequest);
router.patch('/:id/reject', protect, authorize('admin', 'editor'), rejectRequest);

module.exports = router;
