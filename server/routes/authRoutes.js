const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getAllUsers,
    getMe,
    updateUserRole
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, admin, getAllUsers);
router.get('/me', protect, getMe);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
