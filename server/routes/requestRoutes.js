const express = require('express');
const router = express.Router();
const {
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getUserRequests
} = require('../controllers/requestController');

router.route('/')
    .get(getRequests)
    .post(createRequest);

router.route('/user/:userName').get(getUserRequests);

router.route('/:id')
    .put(updateRequest)
    .delete(deleteRequest);

module.exports = router;
