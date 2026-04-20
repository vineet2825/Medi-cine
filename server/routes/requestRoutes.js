const express = require('express');
const router = express.Router();
const {
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getUserRequests
} = require('../controllers/requestController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getRequests)
    .post(protect, createRequest);

router.route('/user/:userName').get(protect, getUserRequests);

router.route('/:id')
    .put(protect, admin, updateRequest)
    .delete(protect, admin, deleteRequest);

module.exports = router;
