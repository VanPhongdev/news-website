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
        required: [true, 'Please provide a reason for deletion'],
        minlength: [10, 'Reason must be at least 10 characters'],
        maxlength: [500, 'Reason cannot exceed 500 characters']
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
