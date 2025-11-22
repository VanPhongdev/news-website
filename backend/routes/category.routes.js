const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { isEditorOrAdmin, isAdmin } = require('../middleware/role.middleware');

// Public routes
router.route('/')
    .get(getCategories)
    .post(protect, isEditorOrAdmin, createCategory);

router.route('/:id')
    .get(getCategory)
    .put(protect, isEditorOrAdmin, updateCategory)
    .delete(protect, isAdmin, deleteCategory);

module.exports = router;
