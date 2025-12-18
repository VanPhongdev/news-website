const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Bảo vệ routes - xác minh JWT token
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra token trong Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Đảm bảo token tồn tại
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Không có quyền truy cập'
        });
    }

    try {
        // Xác minh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy thông tin user từ token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Không có quyền truy cập'
        });
    }
};

// Phân quyền - kiểm tra xem user có vai trò yêu cầu không
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Không có quyền truy cập'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Vai trò '${req.user.role}' không có quyền truy cập`
            });
        }

        next();
    };
};

// Tạo JWT token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};
