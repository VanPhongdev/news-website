const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateUserRole
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

// All user routes require admin access
router.use(protect);
router.use(isAdmin);

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

router.route('/:id/role')
    .put(updateUserRole);

module.exports = router;
