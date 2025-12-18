const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên người dùng'],
        unique: true,
        trim: true,
        lowercase: true, // Tự động chuyển thành chữ thường
        minlength: [3, 'Tên người dùng phải ít nhất 3 ký tự'],
        match: [/^[a-z0-9_]+$/, 'Tên người dùng chỉ được chứa chữ thường, số và dấu gạch dưới']
    },
    displayName: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên hiển thị'],
        trim: true,
        minlength: [2, 'Tên hiển thị phải ít nhất 2 ký tự']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng cung cấp một email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Vui lòng cung cấp một email hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng cung cấp một mật khẩu'],
        minlength: [6, 'Mật khẩu phải ít nhất 6 ký tự'],
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'author', 'reader'],
        default: 'reader'
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

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Update updatedAt trước khi lưu
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Hàm so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
