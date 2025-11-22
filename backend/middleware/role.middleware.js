// Check if user has required role
exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
};

// Check if user is editor or admin
exports.isEditorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Editor or Admin access required'
        });
    }
};

// Check if user is author, editor, or admin
exports.canWriteArticle = (req, res, next) => {
    if (req.user && ['author', 'editor', 'admin'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Author, Editor, or Admin access required'
        });
    }
};

// Check if user can comment (reader or author only)
exports.canComment = (req, res, next) => {
    if (req.user && ['reader', 'author'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Only Reader or Author can comment'
        });
    }
};
