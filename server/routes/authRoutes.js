const express = require('express');
const router = express.Router();
const { 
    register, 
    verifyOTP, 
    login, 
    resendOTP,
    getAllUsers,
    getMe 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);
router.get('/users', protect, admin, getAllUsers);
router.get('/me', protect, getMe);

module.exports = router;
