const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Vui lòng cung cấp lý do xóa'],
        minlength: [10, 'Lý do phải ít nhất 10 ký tự'],
        maxlength: [500, 'Lý do không thể vượt quá 500 ký tự']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
deletionRequestSchema.index({ article: 1, status: 1 });
deletionRequestSchema.index({ author: 1, status: 1 });

module.exports = mongoose.model('DeletionRequest', deletionRequestSchema);
