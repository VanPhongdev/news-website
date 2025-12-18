const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên chuyên mục'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Tự động tạo slug từ name trước khi validate
categorySchema.pre('validate', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }
    next()
});

// Cập nhật timestamp trước khi lưu
categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Category', categorySchema);
