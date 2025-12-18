// Kiểm tra xem user có vai trò yêu cầu không
exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Chưa xác thực'
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

// Kiểm tra xem user có phải là admin không
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Yêu cầu quyền Admin'
        });
    }
};

// Kiểm tra xem user có phải là editor hoặc admin không
exports.isEditorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Yêu cầu quyền Editor hoặc Admin'
        });
    }
};

// Kiểm tra xem user có phải là author, editor hoặc admin không
exports.canWriteArticle = (req, res, next) => {
    if (req.user && ['author', 'editor', 'admin'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Yêu cầu quyền Author, Editor hoặc Admin'
        });
    }
};

// Kiểm tra xem user có thể bình luận không (chỉ reader hoặc author)
exports.canComment = (req, res, next) => {
    if (req.user && ['reader', 'author'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Chỉ Reader hoặc Author mới có thể bình luận'
        });
    }
};
