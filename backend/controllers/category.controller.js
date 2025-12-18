const Category = require('../models/Category');

// @desc    Lấy tất cả chuyên mục
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('createdBy', 'username email');

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy một chuyên mục
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('createdBy', 'username email');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Chuyên mục không tồn tại'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tạo chuyên mục
// @route   POST /api/categories
// @access  Private/Admin/Editor
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Kiểm tra chuyên mục đã tồn tại chưa
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Chuyên mục đã tồn tại'
            });
        }

        const category = await Category.create({
            name,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cập nhật chuyên mục
// @route   PUT /api/categories/:id
// @access  Private/Admin/Editor
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Chuyên mục không tồn tại'
            });
        }

        // Cập nhật các trường
        if (name) category.name = name;
        if (description) category.description = description;

        await category.save();

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa chuyên mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Chuyên mục không tồn tại'
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa chuyên mục thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
