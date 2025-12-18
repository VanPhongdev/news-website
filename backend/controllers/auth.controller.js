const User = require('../models/User');
const { generateToken } = require('../middleware/auth.middleware');

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, displayName, email, password, role } = req.body;

        // Kiểm tra xem người dùng đã tồn tại chưa
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Tên người dùng hoặc email đã tồn tại'
            });
        }

        // Kiểm tra độ dài mật khẩu
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Tạo người dùng
        const user = await User.create({
            username,
            displayName,
            email,
            password,
            role: userRole
        });

        // Tạo token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra username và password
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Xin vui lòng nhập tên người dùng và mật khẩu'
            });
        }

        // Tìm người dùng theo username hoặc email (bao gồm trường password)
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên người dùng hoặc mật khẩu không chính xác'
            });
        }

        // Kiểm tra mật khẩu có khớp không
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Tên người dùng hoặc mật khẩu không chính xác'
            });
        }

        // Tạo token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
