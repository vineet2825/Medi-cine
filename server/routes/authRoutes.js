const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getAllUsers,
    getMe 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, admin, getAllUsers);
router.get('/me', protect, getMe);

module.exports = router;
