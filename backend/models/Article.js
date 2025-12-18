const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng cung cấp tiêu đề'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Vui lòng cung cấp nội dung']
    },
    excerpt: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn chuyên mục']
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'published'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Tự động tạo slug từ title trước khi validate
articleSchema.pre('validate', function (next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            locale: 'vi'
        }) + '-' + Date.now();
    }
    next();
});

// Cập nhật timestamp và set publishedAt trước khi lưu
articleSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Set publishedAt khi status thay đổi thành published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('Article', articleSchema);
