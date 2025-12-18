const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Vui lòng cung cấp nội dung bình luận'],
        trim: true,
        maxlength: [1000, 'Bình luận không thể vượt quá 1000 ký tự']
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: [true, 'Bình luận phải thuộc về một bài viết']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Bình luận phải có tác giả']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Cập nhật timestamp trước khi lưu
commentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index để truy vấn nhanh hơn
commentSchema.index({ article: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
